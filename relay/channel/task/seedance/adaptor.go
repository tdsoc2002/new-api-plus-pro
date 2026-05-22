package seedance

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/relay/channel"
	taskcommon "github.com/QuantumNous/new-api/relay/channel/task/taskcommon"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
)

type requestPayload struct {
	Model         string   `json:"model"`
	Mode          string   `json:"mode"`
	Prompt        string   `json:"prompt"`
	Ratio         string   `json:"ratio,omitempty"`
	Duration      int      `json:"duration,omitempty"`
	Resolution    string   `json:"resolution,omitempty"`
	AutoReview    *bool    `json:"auto_review,omitempty"`
	GenerateAudio *bool    `json:"generate_audio,omitempty"`
	ImageURL      string   `json:"image_url,omitempty"`
	ImageURLs     []string `json:"image_urls,omitempty"`
	VideoURLs     []string `json:"video_urls,omitempty"`
	AudioURLs     []string `json:"audio_urls,omitempty"`
	WebhookURL    string   `json:"webhook_url,omitempty"`
	// VideoRefDuration is a client-supplied hint (seconds) indicating the longest
	// reference video passed in VideoURLs. The generated video must be at least
	// this long. This field is consumed locally and NOT forwarded to the upstream.
	VideoRefDuration int `json:"video_ref_duration,omitempty"`
}

type submitResponse struct {
	ID          string   `json:"id"`
	Status      string   `json:"status"`
	Model       string   `json:"model"`
	Mode        string   `json:"mode"`
	ResultURL   string   `json:"result_url,omitempty"`
	VideoURL    string   `json:"video_url,omitempty"`
	URL         string   `json:"url,omitempty"`
	OutputURL   string   `json:"output_url,omitempty"`
	RemoteURL   string   `json:"remote_url,omitempty"`
	VideoURLs   []string `json:"video_urls,omitempty"`
	CreditsUsed int      `json:"credits_used"`
	CreditsLeft int      `json:"credits_left"`
	Error       *struct {
		Message string `json:"message"`
		Code    string `json:"code"`
	} `json:"error,omitempty"`
}

type listResponse struct {
	Data []submitResponse `json:"data"`
}

type TaskAdaptor struct {
	taskcommon.BaseBilling
	ChannelType int
	apiKey      string
	baseURL     string
}

func (a *TaskAdaptor) Init(info *relaycommon.RelayInfo) {
	a.ChannelType = info.ChannelType
	a.baseURL = strings.TrimRight(info.ChannelBaseUrl, "/")
	a.apiKey = info.ApiKey
}

func (a *TaskAdaptor) ValidateRequestAndSetAction(c *gin.Context, info *relaycommon.RelayInfo) *dto.TaskError {
	return relaycommon.ValidateBasicTaskRequest(c, info, constant.TaskActionGenerate)
}

func (a *TaskAdaptor) BuildRequestURL(info *relaycommon.RelayInfo) (string, error) {
	return fmt.Sprintf("%s/generations", a.baseURL), nil
}

func (a *TaskAdaptor) BuildRequestHeader(c *gin.Context, req *http.Request, info *relaycommon.RelayInfo) error {
	req.Header.Set("Authorization", "Bearer "+a.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	return nil
}

func (a *TaskAdaptor) BuildRequestBody(c *gin.Context, info *relaycommon.RelayInfo) (io.Reader, error) {
	req, err := relaycommon.GetTaskRequest(c)
	if err != nil {
		return nil, err
	}
	body, err := a.convertToRequestPayload(&req, info)
	if err != nil {
		return nil, err
	}
	data, err := common.Marshal(body)
	if err != nil {
		return nil, err
	}
	common.SysLog(fmt.Sprintf("[Seedance] BuildRequestBody mode=%s image_url=%q image_urls=%v body=%s",
		body.Mode, body.ImageURL, body.ImageURLs, string(data)))
	return bytes.NewReader(data), nil
}

func (a *TaskAdaptor) DoRequest(c *gin.Context, info *relaycommon.RelayInfo, requestBody io.Reader) (*http.Response, error) {
	return channel.DoTaskApiRequest(a, c, info, requestBody)
}

func (a *TaskAdaptor) DoResponse(c *gin.Context, resp *http.Response, info *relaycommon.RelayInfo) (taskID string, taskData []byte, taskErr *dto.TaskError) {
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		taskErr = service.TaskErrorWrapper(err, "read_response_body_failed", http.StatusInternalServerError)
		return
	}
	_ = resp.Body.Close()

	var sResp submitResponse
	if err := common.Unmarshal(responseBody, &sResp); err != nil {
		taskErr = service.TaskErrorWrapper(errors.Wrapf(err, "body: %s", responseBody), "unmarshal_response_body_failed", http.StatusInternalServerError)
		return
	}
	if sResp.ID == "" {
		msg := "upstream task id is empty"
		if sResp.Error != nil && sResp.Error.Message != "" {
			msg = sResp.Error.Message
		}
		taskErr = service.TaskErrorWrapperLocal(fmt.Errorf("%s", msg), "task_failed", http.StatusBadRequest)
		return
	}

	ov := dto.NewOpenAIVideo()
	ov.ID = info.PublicTaskID
	ov.TaskID = info.PublicTaskID
	ov.CreatedAt = time.Now().Unix()
	ov.Model = info.OriginModelName
	c.JSON(http.StatusOK, ov)
	return sResp.ID, responseBody, nil
}

func (a *TaskAdaptor) FetchTask(baseUrl, key string, body map[string]any, proxy string) (*http.Response, error) {
	taskID, ok := body["task_id"].(string)
	if !ok || strings.TrimSpace(taskID) == "" {
		return nil, fmt.Errorf("invalid task_id")
	}
	url := fmt.Sprintf("%s/generations/%s", strings.TrimRight(baseUrl, "/"), taskID)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Accept", "application/json")
	client, err := service.GetHttpClientWithProxy(proxy)
	if err != nil {
		return nil, fmt.Errorf("new proxy http client failed: %w", err)
	}
	return client.Do(req)
}

func (a *TaskAdaptor) ParseTaskResult(respBody []byte) (*relaycommon.TaskInfo, error) {
	res := submitResponse{}
	if err := common.Unmarshal(respBody, &res); err != nil {
		var listRes listResponse
		if err2 := common.Unmarshal(respBody, &listRes); err2 != nil {
			return nil, errors.Wrap(err, "unmarshal task result failed")
		}
		if len(listRes.Data) == 0 {
			return nil, fmt.Errorf("empty task result")
		}
		res = listRes.Data[0]
	}

	taskInfo := &relaycommon.TaskInfo{
		TaskID: res.ID,
	}
	switch strings.ToLower(strings.TrimSpace(res.Status)) {
	case "submitted":
		taskInfo.Status = model.TaskStatusSubmitted
	case "queued":
		taskInfo.Status = model.TaskStatusQueued
	case "processing", "running", "in_progress":
		taskInfo.Status = model.TaskStatusInProgress
	case "succeeded", "success", "completed":
		taskInfo.Status = model.TaskStatusSuccess
		// Normalize possible upstream URL fields so downstream record cards can preview videos.
		taskInfo.Url = firstNonEmpty(
			strings.TrimSpace(res.ResultURL),
			strings.TrimSpace(res.VideoURL),
			strings.TrimSpace(res.URL),
			strings.TrimSpace(res.OutputURL),
			strings.TrimSpace(res.RemoteURL),
		)
		if taskInfo.Url == "" && len(res.VideoURLs) > 0 {
			taskInfo.Url = strings.TrimSpace(res.VideoURLs[0])
		}
		// Use upstream credits_used as the actual billed token count.
		if res.CreditsUsed > 0 {
			taskInfo.CompletionTokens = res.CreditsUsed
			taskInfo.TotalTokens = res.CreditsUsed
		}
	case "failed", "error", "cancelled", "canceled":
		taskInfo.Status = model.TaskStatusFailure
		if res.Error != nil && res.Error.Message != "" {
			taskInfo.Reason = res.Error.Message
		}
	default:
		taskInfo.Status = model.TaskStatusInProgress
	}
	return taskInfo, nil
}

func (a *TaskAdaptor) GetModelList() []string {
	return ModelList
}

func (a *TaskAdaptor) GetChannelName() string {
	return ChannelName
}

func (a *TaskAdaptor) ConvertToOpenAIVideo(originTask *model.Task) ([]byte, error) {
	ov := dto.NewOpenAIVideo()
	ov.ID = originTask.TaskID
	ov.TaskID = originTask.TaskID
	ov.Status = originTask.Status.ToVideoStatus()
	ov.SetProgressStr(originTask.Progress)
	ov.CreatedAt = originTask.CreatedAt
	ov.CompletedAt = originTask.UpdatedAt
	if u := originTask.GetResultURL(); u != "" {
		ov.SetMetadata("url", u)
	}
	if originTask.Status == model.TaskStatusFailure && originTask.FailReason != "" {
		ov.Error = &dto.OpenAIVideoError{Message: originTask.FailReason}
	}
	return common.Marshal(ov)
}

func (a *TaskAdaptor) EstimateBilling(c *gin.Context, info *relaycommon.RelayInfo) map[string]float64 {
	req, err := relaycommon.GetTaskRequest(c)
	if err != nil {
		return nil
	}
	payload, err := a.convertToRequestPayload(&req, info)
	if err != nil {
		return nil
	}
	if info.TaskRelayInfo != nil {
		info.TaskRelayInfo.VideoBilling.ResolutionKey = strings.ToLower(strings.TrimSpace(payload.Resolution))
		info.TaskRelayInfo.VideoBilling.IncludeAudio = payload.GenerateAudio
	}
	return map[string]float64{
		"seconds": float64(payload.Duration),
	}
}

func (a *TaskAdaptor) AdjustBillingOnComplete(task *model.Task, taskResult *relaycommon.TaskInfo) int {
	if task == nil || taskResult == nil || taskResult.TotalTokens <= 0 {
		return 0
	}
	bc := task.PrivateData.BillingContext
	if bc == nil || bc.ModelRatio <= 0 || bc.GroupRatio <= 0 {
		return 0
	}
	return int(float64(taskResult.TotalTokens) * bc.ModelRatio * bc.GroupRatio)
}

func (a *TaskAdaptor) convertToRequestPayload(req *relaycommon.TaskSubmitReq, info *relaycommon.RelayInfo) (*requestPayload, error) {
	prompt := strings.TrimSpace(req.Prompt)
	if prompt == "" {
		return nil, fmt.Errorf("prompt is required")
	}
	if len([]rune(prompt)) > 2500 {
		return nil, fmt.Errorf("prompt length must be between 1 and 2500")
	}

	// Mode priority:
	//   1. 0 images            → text_to_video  (always, overrides frontend)
	//   2. 1 image             → image_to_video (always, overrides frontend)
	//   3. frontend sends mode → trust it exactly (first_last_frame / multi_ref)
	//   4. fallback            → multi_ref
	//
	// first_last_frame validation (exactly 2 images) is enforced in the switch below.
	imageCount := 0
	if strings.TrimSpace(req.Image) != "" {
		imageCount++
	}
	imageCount += len(req.Images)

	mode := strings.TrimSpace(req.Mode)
	if imageCount == 0 {
		mode = "text_to_video"
	} else if imageCount == 1 {
		mode = "image_to_video"
	} else if mode != "first_last_frame" && mode != "multi_ref" {
		// 2+ images but no valid scene selection from frontend → default to multi_ref
		mode = "multi_ref"
	}

	r := &requestPayload{
		Model:      taskcommon.DefaultString(upstreamModelName(info), "seedance-2"),
		Mode:       mode,
		Prompt:     req.Prompt,
		Duration:   taskcommon.DefaultInt(req.Duration, 5),
		Ratio:      sizeToRatio(req.Size),
		Resolution: "720p",
	}

	// Merge metadata fields (e.g. resolution, ratio, webhook_url override from frontend).
	if err := taskcommon.UnmarshalMetadata(req.Metadata, r); err != nil {
		return nil, errors.Wrap(err, "unmarshal metadata failed")
	}

	r.Model = strings.TrimSpace(r.Model)
	r.Mode = strings.TrimSpace(r.Mode)
	r.Ratio = strings.TrimSpace(r.Ratio)
	r.Resolution = strings.ToLower(strings.TrimSpace(r.Resolution))
	if r.Duration < 4 {
		r.Duration = 4
	}
	if r.Duration > 15 {
		r.Duration = 15
	}
	if !isSupportedRatio(r.Ratio) {
		return nil, fmt.Errorf("unsupported ratio %q", r.Ratio)
	}
	if !isSupportedResolution(r.Model, r.Resolution) {
		return nil, fmt.Errorf("%s does not support %s resolution", r.Model, r.Resolution)
	}

	// Normalize media fields from generic task request into typed URL fields.
	if req.Image != "" && r.ImageURL == "" {
		r.ImageURL = req.Image
	}
	if len(req.Images) > 0 && len(r.ImageURLs) == 0 {
		r.ImageURLs = append([]string{}, req.Images...)
	}

	// Apply mode-specific defaults and guards.
	switch r.Mode {
	case "image_to_video":
		if r.ImageURL == "" && len(r.ImageURLs) > 0 {
			r.ImageURL = r.ImageURLs[0]
		}
		if r.ImageURL == "" {
			return nil, fmt.Errorf("image_to_video requires image_url")
		}
		// Upstream seedance image_to_video accepts exactly one image input.
		r.ImageURLs = nil
	case "first_last_frame":
		if len(r.ImageURLs) < 2 {
			if r.ImageURL != "" {
				r.ImageURLs = append(r.ImageURLs, r.ImageURL)
			}
		}
		// Filter out empty strings.
		var validURLs []string
		for _, u := range r.ImageURLs {
			if strings.TrimSpace(u) != "" {
				validURLs = append(validURLs, u)
			}
		}
		r.ImageURLs = validURLs
		if len(r.ImageURLs) != 2 {
			return nil, fmt.Errorf("first_last_frame requires exactly 2 non-empty image_urls (got %d)", len(r.ImageURLs))
		}
		r.ImageURL = ""
	case "multi_ref":
		if len(r.ImageURLs)+len(r.VideoURLs)+len(r.AudioURLs) == 0 {
			if r.ImageURL != "" {
				r.ImageURLs = []string{r.ImageURL}
			}
		}
		r.ImageURLs = nonEmptyStrings(r.ImageURLs)
		r.VideoURLs = nonEmptyStrings(r.VideoURLs)
		r.AudioURLs = nonEmptyStrings(r.AudioURLs)
		if len(r.ImageURLs)+len(r.VideoURLs)+len(r.AudioURLs) == 0 {
			return nil, fmt.Errorf("multi_ref requires at least one reference input")
		}
		if len(r.ImageURLs) > 9 {
			return nil, fmt.Errorf("multi_ref supports at most 9 image_urls")
		}
		if len(r.VideoURLs) > 3 {
			return nil, fmt.Errorf("multi_ref supports at most 3 video_urls")
		}
		if len(r.AudioURLs) > 3 {
			return nil, fmt.Errorf("multi_ref supports at most 3 audio_urls")
		}
		// Enforce minimum duration based on reference video length.
		// The client passes video_ref_duration (seconds) indicating the longest
		// reference video; the generated video must be at least that long.
		if len(r.VideoURLs) > 0 && r.VideoRefDuration > 0 {
			if r.Duration < r.VideoRefDuration {
				r.Duration = r.VideoRefDuration
			}
			// Re-clamp to the hard upper limit.
			if r.Duration > 15 {
				r.Duration = 15
			}
		}
	case "text_to_video":
	default:
		return nil, fmt.Errorf("unsupported mode %q", r.Mode)
	}

	// VideoRefDuration is a local hint; do not forward it to the upstream API.
	r.VideoRefDuration = 0

	return r, nil
}

func upstreamModelName(info *relaycommon.RelayInfo) string {
	if info != nil && info.ChannelMeta != nil {
		return info.ChannelMeta.UpstreamModelName
	}
	return ""
}

func isSupportedRatio(ratio string) bool {
	switch strings.TrimSpace(ratio) {
	case "21:9", "16:9", "4:3", "1:1", "3:4", "9:16":
		return true
	default:
		return false
	}
}

func isSupportedResolution(model, resolution string) bool {
	switch strings.TrimSpace(model) {
	case "seedance-2":
		switch strings.ToLower(strings.TrimSpace(resolution)) {
		case "480p", "720p", "1080p":
			return true
		}
	case "seedance-2-fast":
		switch strings.ToLower(strings.TrimSpace(resolution)) {
		case "480p", "720p":
			return true
		}
	}
	return false
}

func nonEmptyStrings(values []string) []string {
	out := make([]string, 0, len(values))
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			out = append(out, v)
		}
	}
	return out
}

func sizeToRatio(size string) string {
	switch strings.TrimSpace(size) {
	case "2560x1080", "1920x816":
		return "21:9"
	case "1280x720", "1920x1080":
		return "16:9"
	case "1024x768", "1088x832":
		return "4:3"
	case "1024x1024", "960x960", "720x720":
		return "1:1"
	case "768x1024", "832x1088":
		return "3:4"
	case "720x1280", "1080x1920":
		return "9:16"
	default:
		return "16:9"
	}
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}
