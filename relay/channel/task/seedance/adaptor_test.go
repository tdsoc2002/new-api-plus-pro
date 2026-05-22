package seedance

import (
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/gin-gonic/gin"
)

func TestEstimateBillingSetsVideoBillingContext(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c := &gin.Context{}
	c.Set("task_request", relaycommon.TaskSubmitReq{
		Prompt:   "make a short video",
		Model:    "seedance-2",
		Mode:     "text_to_video",
		Duration: 4,
		Metadata: map[string]interface{}{
			"resolution":     "720p",
			"generate_audio": true,
		},
	})
	info := &relaycommon.RelayInfo{
		ChannelMeta:   &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2"},
		TaskRelayInfo: &relaycommon.TaskRelayInfo{},
	}

	ratios := (&TaskAdaptor{}).EstimateBilling(c, info)

	if got := ratios["seconds"]; got != 4 {
		t.Fatalf("expected seconds 4, got %v", got)
	}
	if got := info.TaskRelayInfo.VideoBilling.ResolutionKey; got != "720p" {
		t.Fatalf("expected resolution key 720p, got %q", got)
	}
	if info.TaskRelayInfo.VideoBilling.IncludeAudio == nil || !*info.TaskRelayInfo.VideoBilling.IncludeAudio {
		t.Fatalf("expected include audio true, got %#v", info.TaskRelayInfo.VideoBilling.IncludeAudio)
	}
}

func TestEstimateBillingUsesSeedanceDefaults(t *testing.T) {
	gin.SetMode(gin.TestMode)
	c := &gin.Context{}
	c.Set("task_request", relaycommon.TaskSubmitReq{
		Prompt: "make a short video",
		Model:  "seedance-2",
	})
	info := &relaycommon.RelayInfo{
		ChannelMeta:   &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2"},
		TaskRelayInfo: &relaycommon.TaskRelayInfo{},
	}

	ratios := (&TaskAdaptor{}).EstimateBilling(c, info)

	if got := ratios["seconds"]; got != 5 {
		t.Fatalf("expected default seconds 5, got %v", got)
	}
	if got := info.TaskRelayInfo.VideoBilling.ResolutionKey; got != "720p" {
		t.Fatalf("expected default resolution key 720p, got %q", got)
	}
	if info.TaskRelayInfo.VideoBilling.IncludeAudio != nil {
		t.Fatalf("expected default include audio to be unspecified, got %#v", info.TaskRelayInfo.VideoBilling.IncludeAudio)
	}
}

func TestConvertToRequestPayloadMatchesDocumentDefaults(t *testing.T) {
	req := &relaycommon.TaskSubmitReq{
		Prompt: "make a short video",
		Model:  "seedance-2",
	}
	info := &relaycommon.RelayInfo{
		ChannelMeta: &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2"},
	}

	payload, err := (&TaskAdaptor{}).convertToRequestPayload(req, info)
	if err != nil {
		t.Fatal(err)
	}
	body, err := common.Marshal(payload)
	if err != nil {
		t.Fatal(err)
	}
	bodyText := string(body)

	if strings.Contains(bodyText, "auto_review") {
		t.Fatalf("default payload must not include auto_review: %s", bodyText)
	}
	if strings.Contains(bodyText, "generate_audio") {
		t.Fatalf("default payload must not include generate_audio: %s", bodyText)
	}
	if payload.Mode != "text_to_video" {
		t.Fatalf("expected text_to_video, got %q", payload.Mode)
	}
}

func TestConvertToRequestPayloadValidatesSeedanceDocConstraints(t *testing.T) {
	info := &relaycommon.RelayInfo{
		ChannelMeta: &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2-fast"},
	}

	_, err := (&TaskAdaptor{}).convertToRequestPayload(&relaycommon.TaskSubmitReq{
		Prompt: "make a short video",
		Metadata: map[string]interface{}{
			"resolution": "1080p",
		},
	}, info)
	if err == nil || !strings.Contains(err.Error(), "does not support 1080p") {
		t.Fatalf("expected fast 1080p validation error, got %v", err)
	}

	_, err = (&TaskAdaptor{}).convertToRequestPayload(&relaycommon.TaskSubmitReq{
		Prompt: strings.Repeat("字", 2501),
	}, &relaycommon.RelayInfo{ChannelMeta: &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2"}})
	if err == nil || !strings.Contains(err.Error(), "2500") {
		t.Fatalf("expected prompt length validation error, got %v", err)
	}

	_, err = (&TaskAdaptor{}).convertToRequestPayload(&relaycommon.TaskSubmitReq{
		Prompt: "make a short video",
		Metadata: map[string]interface{}{
			"ratio": "2:1",
		},
	}, &relaycommon.RelayInfo{ChannelMeta: &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2"}})
	if err == nil || !strings.Contains(err.Error(), "unsupported ratio") {
		t.Fatalf("expected ratio validation error, got %v", err)
	}
}

func TestConvertToRequestPayloadValidatesMultiRefLimits(t *testing.T) {
	req := &relaycommon.TaskSubmitReq{
		Prompt: "use references",
		Mode:   "multi_ref",
		Images: []string{
			"https://cdn.example.com/1.png",
			"https://cdn.example.com/2.png",
			"https://cdn.example.com/3.png",
			"https://cdn.example.com/4.png",
			"https://cdn.example.com/5.png",
			"https://cdn.example.com/6.png",
			"https://cdn.example.com/7.png",
			"https://cdn.example.com/8.png",
			"https://cdn.example.com/9.png",
			"https://cdn.example.com/10.png",
		},
	}

	_, err := (&TaskAdaptor{}).convertToRequestPayload(req, &relaycommon.RelayInfo{ChannelMeta: &relaycommon.ChannelMeta{UpstreamModelName: "seedance-2"}})
	if err == nil || !strings.Contains(err.Error(), "at most 9 image_urls") {
		t.Fatalf("expected image limit validation error, got %v", err)
	}
}

func TestAdjustBillingOnCompleteUsesUpstreamCreditsOnly(t *testing.T) {
	task := &model.Task{
		PrivateData: model.TaskPrivateData{
			BillingContext: &model.TaskBillingContext{
				ModelRatio: 2,
				GroupRatio: 3,
				OtherRatios: map[string]float64{
					"seconds": 6,
				},
			},
		},
	}
	taskResult := &relaycommon.TaskInfo{TotalTokens: 12}

	got := (&TaskAdaptor{}).AdjustBillingOnComplete(task, taskResult)
	if got != 72 {
		t.Fatalf("expected quota 72 from credits * modelRatio * groupRatio, got %d", got)
	}
}
