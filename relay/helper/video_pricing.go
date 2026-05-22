package helper

import (
	"fmt"

	"github.com/QuantumNous/new-api/common"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

// ApplyVideoCompositeQuota 若该模型启用了视频复合定价，则根据规则重算 Quota，并标记 VideoComposite。
// 调用前须已执行 ModelPriceHelperPerCall，且 OtherRatios 已合并 EstimateBilling（至少含 seconds 时可更准确）。
func ApplyVideoCompositeQuota(info *relaycommon.RelayInfo, modelName string) bool {
	rule, ok := ratio_setting.GetVideoPricingRule(modelName)
	if !ok || !rule.Enabled {
		return false
	}

	seconds := 0
	if info.PriceData.OtherRatios != nil {
		seconds = int(info.PriceData.OtherRatios["seconds"])
	}
	if seconds <= 0 {
		if rule.DefaultSeconds > 0 {
			seconds = rule.DefaultSeconds
		} else {
			seconds = 4
		}
	}

	resKey := ""
	var includeAudio *bool
	if info.TaskRelayInfo != nil {
		resKey = info.TaskRelayInfo.VideoBilling.ResolutionKey
		includeAudio = info.TaskRelayInfo.VideoBilling.IncludeAudio
	}

	baseSnapshot := info.PriceData.MapModelPriceUSD
	usd := ratio_setting.ComputeVideoPricingUSD(rule, baseSnapshot, seconds, resKey, includeAudio)
	if usd < 0 {
		usd = 0
	}

	gr := info.PriceData.GroupRatioInfo.GroupRatio
	info.PriceData.ModelPrice = usd
	info.PriceData.Quota = int(usd * common.QuotaPerUnit * gr)
	info.PriceData.VideoComposite = true

	ratios := make(map[string]float64)
	ratios["video_composite"] = 1
	ratios["seconds"] = float64(seconds)
	ratios["price_usd"] = usd
	if resKey != "" {
		ratios["resolution"] = 1
		ratios[fmt.Sprintf("res_%s", resKey)] = 1
	}
	if includeAudio != nil {
		if *includeAudio {
			ratios["audio"] = 1
		} else {
			ratios["audio"] = 0
		}
	}
	info.PriceData.OtherRatios = ratios
	return true
}
