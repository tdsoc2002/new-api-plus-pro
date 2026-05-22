package relay

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
)

func ResolveSeedanceAssets(c *gin.Context, info *relaycommon.RelayInfo) *dto.TaskError {
	if c.Request == nil || c.Request.Method != http.MethodPost || !strings.Contains(c.Request.URL.Path, "/v1/videos") {
		return nil
	}
	var req relaycommon.TaskSubmitReq
	if err := common.UnmarshalBodyReusable(c, &req); err != nil {
		return nil
	}
	ids := collectSeedanceAssetIDs(req)
	if len(ids) == 0 {
		return nil
	}
	userID := info.UserId
	if userID == 0 {
		userID = c.GetInt("id")
	}
	var lockedChannelID int
	for _, id := range ids {
		asset, err := model.GetSeedanceAssetByOfficialID(userID, id)
		if err != nil {
			return service.TaskErrorWrapperLocal(fmt.Errorf("asset %s not found", id), "asset_not_found", http.StatusBadRequest)
		}
		if !strings.EqualFold(asset.Status, model.SeedanceAssetStatusActive) {
			return service.TaskErrorWrapperLocal(fmt.Errorf("asset %s is not active", id), "asset_not_active", http.StatusBadRequest)
		}
		if lockedChannelID == 0 {
			lockedChannelID = asset.ChannelID
		} else if lockedChannelID != asset.ChannelID {
			return service.TaskErrorWrapperLocal(fmt.Errorf("assets must belong to the same Seedance channel"), "asset_channel_mismatch", http.StatusBadRequest)
		}
	}
	ch, err := model.GetChannelById(lockedChannelID, true)
	if err != nil {
		return service.TaskErrorWrapperLocal(err, "asset_channel_not_found", http.StatusBadRequest)
	}
	info.LockedChannel = ch
	return nil
}

func collectSeedanceAssetIDs(req relaycommon.TaskSubmitReq) []string {
	seen := map[string]struct{}{}
	var ids []string
	add := func(value string) {
		value = strings.TrimSpace(value)
		if !strings.HasPrefix(value, "asset://") {
			return
		}
		id := strings.TrimSpace(strings.TrimPrefix(value, "asset://"))
		if id == "" {
			return
		}
		if _, ok := seen[id]; ok {
			return
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
	}
	add(req.Image)
	add(req.InputReference)
	for _, v := range req.Images {
		add(v)
	}
	for _, key := range []string{"image_url", "video_url", "audio_url"} {
		if v, ok := req.Metadata[key].(string); ok {
			add(v)
		}
	}
	for _, key := range []string{"image_urls", "video_urls", "audio_urls"} {
		switch v := req.Metadata[key].(type) {
		case []string:
			for _, item := range v {
				add(item)
			}
		case []any:
			for _, item := range v {
				if s, ok := item.(string); ok {
					add(s)
				}
			}
		}
	}
	return ids
}
