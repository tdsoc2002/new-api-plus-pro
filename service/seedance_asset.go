package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/asset_storage_setting"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/gin-gonic/gin"
	"github.com/volcengine/ve-tos-golang-sdk/v2/tos"
)

type SeedanceAssetGroupResponse struct {
	ID          int64  `json:"id"`
	OfficialID  string `json:"officialId"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	CreatedAt   string `json:"createdAt,omitempty"`
}

type SeedanceAssetResponse struct {
	ID         int64  `json:"id"`
	OfficialID string `json:"officialId"`
	Name       string `json:"name,omitempty"`
	Status     string `json:"status,omitempty"`
	ImageURL   string `json:"imageUrl,omitempty"`
	VideoURL   string `json:"videoUrl,omitempty"`
	URL        string `json:"url,omitempty"`
	CreatedAt  string `json:"createdAt,omitempty"`
	Error      *struct {
		Message string `json:"message"`
		Code    string `json:"code"`
	} `json:"error,omitempty"`
}

type SeedanceAssetListResponse struct {
	Data []SeedanceAssetResponse `json:"data"`
}

type SeedanceAssetUploadRequest struct {
	GroupID string `json:"groupId"`
	URL     string `json:"url"`
	Name    string `json:"name,omitempty"`
}

type seedanceAssetClient struct {
	baseURL string
	apiKey  string
	proxy   string
}

func newSeedanceAssetClient(ch *model.Channel) (*seedanceAssetClient, error) {
	key, _, apiErr := ch.GetNextEnabledKey()
	if apiErr != nil {
		return nil, apiErr
	}
	baseURL := ch.GetBaseURL()
	if baseURL == "" {
		baseURL = constant.ChannelBaseURLs[ch.Type]
	}
	return &seedanceAssetClient{
		baseURL: strings.TrimRight(baseURL, "/"),
		apiKey:  key,
		proxy:   ch.GetSetting().Proxy,
	}, nil
}

func (c *seedanceAssetClient) doJSON(ctx context.Context, method, apiPath string, reqBody any, out any) error {
	var body io.Reader
	if reqBody != nil {
		data, err := common.Marshal(reqBody)
		if err != nil {
			return err
		}
		body = bytes.NewReader(data)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+apiPath, body)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Accept", "application/json")
	if reqBody != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	client, err := GetHttpClientWithProxy(c.proxy)
	if err != nil {
		return err
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("seedance asset upstream status %d: %s", resp.StatusCode, strings.TrimSpace(string(respBody)))
	}
	if out != nil && len(respBody) > 0 {
		if err := common.Unmarshal(respBody, out); err != nil {
			return err
		}
	}
	return nil
}

func (c *seedanceAssetClient) CreateGroup(ctx context.Context, name, description string) (*SeedanceAssetGroupResponse, error) {
	var out SeedanceAssetGroupResponse
	err := c.doJSON(ctx, http.MethodPost, "/asset-groups", map[string]string{
		"name":        name,
		"description": description,
	}, &out)
	return &out, err
}

func (c *seedanceAssetClient) UploadAsset(ctx context.Context, req SeedanceAssetUploadRequest) (*SeedanceAssetResponse, error) {
	var out SeedanceAssetResponse
	err := c.doJSON(ctx, http.MethodPost, "/assets", req, &out)
	return &out, err
}

func (c *seedanceAssetClient) GetAsset(ctx context.Context, officialID string) (*SeedanceAssetResponse, error) {
	var out SeedanceAssetResponse
	err := c.doJSON(ctx, http.MethodGet, "/assets/"+url.PathEscape(officialID), nil, &out)
	return &out, err
}

func (c *seedanceAssetClient) DeleteAsset(ctx context.Context, officialID string) error {
	return c.doJSON(ctx, http.MethodDelete, "/assets/"+url.PathEscape(officialID), nil, nil)
}

type TOSObjectStore struct {
	client *tos.ClientV2
	cfg    asset_storage_setting.AssetStorageSetting
}

func NewTOSObjectStore() (*TOSObjectStore, error) {
	cfg := asset_storage_setting.GetSetting()
	if !cfg.Enabled {
		return nil, errors.New("asset storage is disabled")
	}
	if strings.TrimSpace(cfg.TOSAccessKey) == "" || strings.TrimSpace(cfg.TOSSecretKey) == "" ||
		strings.TrimSpace(cfg.TOSEndpoint) == "" || strings.TrimSpace(cfg.TOSRegion) == "" ||
		strings.TrimSpace(cfg.TOSBucket) == "" || strings.TrimSpace(cfg.TOSPublicBaseURL) == "" {
		return nil, errors.New("TOS asset storage is not configured")
	}
	client, err := tos.NewClientV2(
		cfg.TOSEndpoint,
		tos.WithRegion(cfg.TOSRegion),
		tos.WithCredentialsProvider(tos.NewStaticCredentialsProvider(cfg.TOSAccessKey, cfg.TOSSecretKey, cfg.TOSSecurityToken)),
	)
	if err != nil {
		return nil, err
	}
	return &TOSObjectStore{client: client, cfg: cfg}, nil
}

func (s *TOSObjectStore) Put(ctx context.Context, key string, body io.Reader, size int64, contentType string) (string, error) {
	_, err := s.client.PutObjectV2(ctx, &tos.PutObjectV2Input{
		PutObjectBasicInput: tos.PutObjectBasicInput{
			Bucket:        s.cfg.TOSBucket,
			Key:           key,
			ContentLength: size,
			ContentType:   contentType,
		},
		Content: body,
	})
	if err != nil {
		return "", err
	}
	base := strings.TrimRight(s.cfg.TOSPublicBaseURL, "/")
	return base + "/" + strings.TrimLeft(key, "/"), nil
}

func (s *TOSObjectStore) Delete(ctx context.Context, key string) error {
	if strings.TrimSpace(key) == "" {
		return nil
	}
	_, err := s.client.DeleteObjectV2(ctx, &tos.DeleteObjectV2Input{
		Bucket: s.cfg.TOSBucket,
		Key:    key,
	})
	return err
}

type CreateSeedanceAssetGroupInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type UploadSeedanceAssetURLInput struct {
	GroupID string `json:"group_id"`
	URL     string `json:"url"`
	Name    string `json:"name"`
}

func SelectSeedanceAssetChannel(c *gin.Context) (*model.Channel, error) {
	group := c.GetString("group")
	if group == "" {
		group = c.GetString("user_group")
	}
	if group == "" {
		group = "default"
	}
	cfg := asset_storage_setting.GetSetting()
	modelName := cfg.SeedanceDefaultModel
	if modelName == "" {
		modelName = "seedance-2"
	}
	ch, _, err := CacheGetRandomSatisfiedChannel(&RetryParam{
		Ctx:        c,
		ModelName:  modelName,
		TokenGroup: group,
		Retry:      common.GetPointer(0),
	})
	return ch, err
}

func EnsureDefaultSeedanceAssetGroup(c *gin.Context, userID int, ch *model.Channel) (*model.SeedanceAssetGroup, error) {
	var group model.SeedanceAssetGroup
	err := model.DB.Where("user_id = ? AND channel_id = ?", userID, ch.Id).First(&group).Error
	if err == nil {
		return &group, nil
	}
	cfg := asset_storage_setting.GetSetting()
	name := strings.TrimSpace(cfg.SeedanceDefaultGroupName)
	if name == "" {
		name = "Default Library"
	}
	client, err := newSeedanceAssetClient(ch)
	if err != nil {
		return nil, err
	}
	upstream, err := client.CreateGroup(c.Request.Context(), name, "Default asset library")
	if err != nil {
		return nil, err
	}
	now := time.Now().Unix()
	group = model.SeedanceAssetGroup{
		UserID:      userID,
		ChannelID:   ch.Id,
		OfficialID:  upstream.OfficialID,
		Name:        upstream.Name,
		Description: "Default asset library",
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if group.Name == "" {
		group.Name = name
	}
	return &group, model.DB.Create(&group).Error
}

func CreateSeedanceAssetGroup(c *gin.Context, userID int, input CreateSeedanceAssetGroupInput) (*model.SeedanceAssetGroup, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	ch, err := SelectSeedanceAssetChannel(c)
	if err != nil {
		return nil, err
	}
	client, err := newSeedanceAssetClient(ch)
	if err != nil {
		return nil, err
	}
	upstream, err := client.CreateGroup(c.Request.Context(), name, input.Description)
	if err != nil {
		return nil, err
	}
	now := time.Now().Unix()
	group := &model.SeedanceAssetGroup{
		UserID:      userID,
		ChannelID:   ch.Id,
		OfficialID:  upstream.OfficialID,
		Name:        upstream.Name,
		Description: input.Description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if group.Name == "" {
		group.Name = name
	}
	return group, model.DB.Create(group).Error
}

func UploadSeedanceAssetByURL(c *gin.Context, userID int, input UploadSeedanceAssetURLInput) (*model.SeedanceAsset, error) {
	sourceURL := strings.TrimSpace(input.URL)
	if sourceURL == "" {
		return nil, errors.New("url is required")
	}
	fetchSetting := system_setting.GetFetchSetting()
	if err := common.ValidateURLWithFetchSetting(sourceURL, fetchSetting.EnableSSRFProtection, fetchSetting.AllowPrivateIp, fetchSetting.DomainFilterMode, fetchSetting.IpFilterMode, fetchSetting.DomainList, fetchSetting.IpList, fetchSetting.AllowedPorts, fetchSetting.ApplyIPFilterForDomain); err != nil {
		return nil, fmt.Errorf("url must be a public http(s) URL: %w", err)
	}
	group, ch, err := resolveSeedanceAssetGroup(c, userID, input.GroupID)
	if err != nil {
		return nil, err
	}
	client, err := newSeedanceAssetClient(ch)
	if err != nil {
		return nil, err
	}
	upstream, err := client.UploadAsset(c.Request.Context(), SeedanceAssetUploadRequest{
		GroupID: group.OfficialID,
		URL:     sourceURL,
		Name:    input.Name,
	})
	if err != nil {
		return nil, err
	}
	asset := createLocalSeedanceAsset(userID, group, ch, upstream, input.Name, sourceURL, model.SeedanceAssetStorageProviderExternal, "", "", 0, "")
	return asset, model.DB.Create(asset).Error
}

func UploadSeedanceAssetFile(c *gin.Context, userID int, groupID string, name string, fileHeader *multipart.FileHeader) (*model.SeedanceAsset, error) {
	cfg := asset_storage_setting.GetSetting()
	if !cfg.Enabled {
		return nil, errors.New("asset storage is disabled")
	}
	if fileHeader == nil {
		return nil, errors.New("file is required")
	}
	if cfg.MaxFileSizeBytes > 0 && fileHeader.Size > cfg.MaxFileSizeBytes {
		return nil, fmt.Errorf("file exceeds maximum size %d bytes", cfg.MaxFileSizeBytes)
	}
	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()
	head := make([]byte, 512)
	n, _ := io.ReadFull(file, head)
	head = head[:n]
	contentType := http.DetectContentType(head)
	if !mimeAllowed(contentType, cfg.AllowedMimeTypes) {
		return nil, fmt.Errorf("unsupported content type %s", contentType)
	}
	body := io.MultiReader(bytes.NewReader(head), file)

	if err := model.ReserveUserAssetStorage(userID, fileHeader.Size, cfg.DefaultLimitBytes); err != nil {
		return nil, errors.New("asset storage quota exceeded")
	}
	reserved := true
	defer func() {
		if reserved {
			_ = model.ReleaseUserAssetStorage(userID, fileHeader.Size)
		}
	}()

	group, ch, err := resolveSeedanceAssetGroup(c, userID, groupID)
	if err != nil {
		return nil, err
	}
	store, err := NewTOSObjectStore()
	if err != nil {
		return nil, err
	}
	key := buildTOSObjectKey(userID, fileHeader.Filename)
	sourceURL, err := store.Put(c.Request.Context(), key, body, fileHeader.Size, contentType)
	if err != nil {
		return nil, err
	}
	tosUploaded := true
	defer func() {
		if tosUploaded {
			_ = store.Delete(context.Background(), key)
		}
	}()

	client, err := newSeedanceAssetClient(ch)
	if err != nil {
		return nil, err
	}
	upstream, err := client.UploadAsset(c.Request.Context(), SeedanceAssetUploadRequest{
		GroupID: group.OfficialID,
		URL:     sourceURL,
		Name:    name,
	})
	if err != nil {
		return nil, err
	}
	asset := createLocalSeedanceAsset(userID, group, ch, upstream, name, sourceURL, model.SeedanceAssetStorageProviderTOS, cfg.TOSBucket, key, fileHeader.Size, contentType)
	if err := model.DB.Create(asset).Error; err != nil {
		return nil, err
	}
	reserved = false
	tosUploaded = false
	return asset, nil
}

func ListSeedanceAssets(userID int, groupID string, status string, pageNum, pageSize int) ([]model.SeedanceAsset, int64, error) {
	if pageNum < 1 {
		pageNum = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	q := model.DB.Model(&model.SeedanceAsset{}).Where("user_id = ? AND deleted_at = 0", userID)
	if strings.TrimSpace(groupID) != "" {
		group, err := findUserSeedanceAssetGroup(userID, groupID)
		if err != nil {
			return nil, 0, err
		}
		q = q.Where("group_id = ?", group.ID)
	}
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var items []model.SeedanceAsset
	err := q.Order("id DESC").Offset((pageNum - 1) * pageSize).Limit(pageSize).Find(&items).Error
	return items, total, err
}

func ListSeedanceAssetGroups(userID int) ([]model.SeedanceAssetGroup, error) {
	var groups []model.SeedanceAssetGroup
	err := model.DB.Where("user_id = ?", userID).Order("id DESC").Find(&groups).Error
	return groups, err
}

func SyncSeedanceAsset(c *gin.Context, userID int, officialID string) (*model.SeedanceAsset, error) {
	asset, err := model.GetSeedanceAssetByOfficialID(userID, officialID)
	if err != nil {
		return nil, err
	}
	ch, err := model.CacheGetChannel(asset.ChannelID)
	if err != nil {
		return nil, err
	}
	client, err := newSeedanceAssetClient(ch)
	if err != nil {
		return nil, err
	}
	upstream, err := client.GetAsset(c.Request.Context(), asset.OfficialID)
	if err != nil {
		return nil, err
	}
	updateAssetFromUpstream(asset, upstream)
	asset.LastSyncedAt = time.Now().Unix()
	asset.UpdatedAt = asset.LastSyncedAt
	return asset, model.DB.Save(asset).Error
}

func DeleteSeedanceAsset(c *gin.Context, userID int, officialID string) error {
	asset, err := model.GetSeedanceAssetByOfficialID(userID, officialID)
	if err != nil {
		return err
	}
	ch, err := model.CacheGetChannel(asset.ChannelID)
	if err == nil {
		if client, cErr := newSeedanceAssetClient(ch); cErr == nil {
			_ = client.DeleteAsset(c.Request.Context(), asset.OfficialID)
		}
	}
	if asset.StorageProvider == model.SeedanceAssetStorageProviderTOS && asset.StorageKey != "" {
		if store, sErr := NewTOSObjectStore(); sErr == nil {
			if err := store.Delete(c.Request.Context(), asset.StorageKey); err != nil {
				return err
			}
		}
	}
	now := time.Now().Unix()
	asset.DeletedAt = now
	asset.UpdatedAt = now
	if err := model.DB.Save(asset).Error; err != nil {
		return err
	}
	return model.ReleaseUserAssetStorage(userID, asset.SizeBytes)
}

func GetUserAssetStorage(userID int) (*model.UserAssetStorage, error) {
	cfg := asset_storage_setting.GetSetting()
	return model.EnsureUserAssetStorage(userID, cfg.DefaultLimitBytes)
}

func resolveSeedanceAssetGroup(c *gin.Context, userID int, groupOfficialID string) (*model.SeedanceAssetGroup, *model.Channel, error) {
	if strings.TrimSpace(groupOfficialID) != "" {
		group, err := findUserSeedanceAssetGroup(userID, groupOfficialID)
		if err != nil {
			return nil, nil, err
		}
		ch, err := model.CacheGetChannel(group.ChannelID)
		return group, ch, err
	}
	ch, err := SelectSeedanceAssetChannel(c)
	if err != nil {
		return nil, nil, err
	}
	group, err := EnsureDefaultSeedanceAssetGroup(c, userID, ch)
	return group, ch, err
}

func findUserSeedanceAssetGroup(userID int, groupID string) (*model.SeedanceAssetGroup, error) {
	groupID = strings.TrimSpace(groupID)
	var group model.SeedanceAssetGroup
	q := model.DB.Where("user_id = ?", userID)
	if id, err := strconv.ParseInt(groupID, 10, 64); err == nil {
		q = q.Where("id = ? OR official_id = ?", id, groupID)
	} else {
		q = q.Where("official_id = ?", groupID)
	}
	if err := q.First(&group).Error; err != nil {
		return nil, err
	}
	return &group, nil
}

func createLocalSeedanceAsset(userID int, group *model.SeedanceAssetGroup, ch *model.Channel, upstream *SeedanceAssetResponse, name string, sourceURL string, provider string, bucket string, key string, size int64, contentType string) *model.SeedanceAsset {
	now := time.Now().Unix()
	asset := &model.SeedanceAsset{
		UserID:          userID,
		GroupID:         group.ID,
		ChannelID:       ch.Id,
		OfficialID:      upstream.OfficialID,
		Name:            firstNonEmptyString(upstream.Name, name, path.Base(sourceURL)),
		Status:          firstNonEmptyString(upstream.Status, model.SeedanceAssetStatusProcessing),
		SourceURL:       sourceURL,
		PreviewURL:      firstNonEmptyString(upstream.ImageURL, upstream.VideoURL, upstream.URL, sourceURL),
		StorageProvider: provider,
		StorageBucket:   bucket,
		StorageKey:      key,
		ContentType:     contentType,
		SizeBytes:       size,
		CreatedAt:       now,
		UpdatedAt:       now,
		LastSyncedAt:    now,
	}
	if upstream.Error != nil {
		asset.FailReason = upstream.Error.Message
	}
	if asset.OfficialID == "" {
		asset.OfficialID = upstream.URL
	}
	return asset
}

func updateAssetFromUpstream(asset *model.SeedanceAsset, upstream *SeedanceAssetResponse) {
	if upstream.Name != "" {
		asset.Name = upstream.Name
	}
	if upstream.Status != "" {
		asset.Status = upstream.Status
	}
	if p := firstNonEmptyString(upstream.ImageURL, upstream.VideoURL, upstream.URL); p != "" {
		asset.PreviewURL = p
	}
	if upstream.Error != nil {
		asset.FailReason = upstream.Error.Message
	}
}

func buildTOSObjectKey(userID int, filename string) string {
	cfg := asset_storage_setting.GetSetting()
	prefix := strings.Trim(strings.TrimSpace(cfg.TOSKeyPrefix), "/")
	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		ext = ".bin"
	}
	random, _ := common.GenerateRandomCharsKey(24)
	now := time.Now()
	return path.Join(prefix, fmt.Sprintf("%d", userID), now.Format("2006/01"), random+ext)
}

func mimeAllowed(contentType string, allowed string) bool {
	contentType = strings.ToLower(strings.TrimSpace(strings.Split(contentType, ";")[0]))
	for _, item := range strings.Split(allowed, ",") {
		if strings.EqualFold(strings.TrimSpace(item), contentType) {
			return true
		}
	}
	return false
}

func firstNonEmptyString(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}
