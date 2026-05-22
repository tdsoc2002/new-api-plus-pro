package ratio_setting

import (
	"strings"

	"github.com/QuantumNous/new-api/types"
)

// VideoTierHints 供 /api/pricing 与文生视频页等：按视频复合定价配置决定可选分辨率按钮与有声/无声是否展示。
type VideoTierHints struct {
	CompositeEnabled bool `json:"composite_enabled"`
	// ResolutionLabels 由管理端分辨率键推断为 480P/720P/1080P 等；为空且 composite_enabled 时表示未配置任何可识别档位，前端隐藏分辨率区。
	ResolutionLabels []string `json:"resolution_labels,omitempty"`
	ShowVoicedOption bool     `json:"show_voiced_option"`
	ShowSilentOption bool     `json:"show_silent_option"`
}

// VideoPricingRule 视频任务复合定价（美元维度叠加），仅对配置了且 enabled 的模型生效。
// 未配置或未启用的模型仍走「模型固定价格 × OtherRatios 连乘」的旧逻辑。
type VideoPricingRule struct {
	Enabled               bool    `json:"enabled"`
	IncludeModelPriceBase bool    `json:"include_model_price_base"`
	ExtraBaseUSD          float64 `json:"extra_base_usd"`
	USDPerSecond          float64 `json:"usd_per_second"`
	// ResolutionUSDPerSecond 旧版：单档每秒加价（有声/无声同价），读配置时仍兼容。
	ResolutionUSDPerSecond map[string]float64 `json:"resolution_usd_per_second,omitempty"`
	// ResolutionTierUSDPerSecond 每分辨率分别配置有声/无声每秒加价（与 USDPerSecond 相加后再乘秒数）。
	ResolutionTierUSDPerSecond map[string]VideoResolutionTierUSD `json:"resolution_tier_usd_per_second,omitempty"`
	DefaultSeconds             int                               `json:"default_seconds"`
}

// VideoResolutionTierUSD 某分辨率下与「统一秒价」叠加的每秒美元单价。
type VideoResolutionTierUSD struct {
	VoicedUSDPerSecond float64 `json:"voiced_usd_per_second"`
	SilentUSDPerSecond float64 `json:"silent_usd_per_second"`
}

var videoPricingRulesMap = types.NewRWMap[string, VideoPricingRule]()

func VideoPricingRules2JSONString() string {
	return videoPricingRulesMap.MarshalJSONString()
}

// VideoPricingRulesReadAll 返回视频复合定价规则副本（供定价列表补充仅配置在规则中的模型）。
func VideoPricingRulesReadAll() map[string]VideoPricingRule {
	return videoPricingRulesMap.ReadAll()
}

func UpdateVideoPricingRulesByJSONString(jsonStr string) error {
	return types.LoadFromJsonStringWithCallback(videoPricingRulesMap, jsonStr, InvalidateExposedDataCache)
}

// GetVideoPricingRule 按与模型倍率相同的名称规范化后查找规则。
func GetVideoPricingRule(name string) (VideoPricingRule, bool) {
	name = FormatMatchingModelName(name)
	return videoPricingRulesMap.Get(name)
}

func lookupResolutionUSD(m map[string]float64, key string) float64 {
	if len(m) == 0 {
		return 0
	}
	k := strings.TrimSpace(strings.ToLower(key))
	if k != "" {
		if v, ok := m[k]; ok {
			return v
		}
		for mk, mv := range m {
			if strings.EqualFold(strings.TrimSpace(mk), key) {
				return mv
			}
		}
		if pLabel := inferResolutionPLabel(k); pLabel != "" {
			pl := strings.ToLower(pLabel)
			if v, ok := m[pl]; ok {
				return v
			}
			for mk, mv := range m {
				if strings.EqualFold(strings.TrimSpace(mk), pLabel) {
					return mv
				}
			}
		}
	}
	if v, ok := m["_default"]; ok {
		return v
	}
	return 0
}

func lookupResolutionTier(m map[string]VideoResolutionTierUSD, key string) (VideoResolutionTierUSD, bool) {
	if len(m) == 0 {
		return VideoResolutionTierUSD{}, false
	}
	k := strings.TrimSpace(strings.ToLower(key))
	if k != "" {
		if v, ok := m[k]; ok {
			return v, true
		}
		for mk, mv := range m {
			if strings.EqualFold(strings.TrimSpace(mk), key) {
				return mv, true
			}
		}
		if pLabel := inferResolutionPLabel(k); pLabel != "" {
			pl := strings.ToLower(pLabel)
			if v, ok := m[pl]; ok {
				return v, true
			}
			for mk, mv := range m {
				if strings.EqualFold(strings.TrimSpace(mk), pLabel) {
					return mv, true
				}
			}
		}
	}
	if v, ok := m["_default"]; ok {
		return v, true
	}
	return VideoResolutionTierUSD{}, false
}

// tierAddPerSec 返回与「统一秒价」叠加的分辨率档每秒加价；优先新结构（有声/无声分列），否则旧版单值。
func tierAddPerSec(rule VideoPricingRule, resolutionKey string, includeAudio *bool) float64 {
	if t, ok := lookupResolutionTier(rule.ResolutionTierUSDPerSecond, resolutionKey); ok {
		// 未传音频信息时按有声计价（与上游可区分后再填无声价）
		if includeAudio != nil && !*includeAudio {
			return t.SilentUSDPerSecond
		}
		return t.VoicedUSDPerSecond
	}
	return lookupResolutionUSD(rule.ResolutionUSDPerSecond, resolutionKey)
}

var pixelSizeToPLabel = map[string]string{
	"832*480": "480P", "480*832": "480P", "624*624": "480P",
	"1280*720": "720P", "720*1280": "720P", "960*960": "720P", "1088*832": "720P", "832*1088": "720P",
	"1920*1080": "1080P", "1080*1920": "1080P", "1440*1440": "1080P", "1632*1248": "1080P", "1248*1632": "1080P",
}

func inferResolutionPLabel(tierKey string) string {
	k := strings.ToLower(strings.TrimSpace(tierKey))
	if k == "" {
		return ""
	}
	if label, ok := pixelSizeToPLabel[k]; ok {
		return label
	}
	if strings.Contains(k, "1080") || strings.Contains(k, "1920") {
		return "1080P"
	}
	if strings.Contains(k, "480") || strings.Contains(k, "854") {
		return "480P"
	}
	if strings.Contains(k, "720") || strings.Contains(k, "1280") {
		return "720P"
	}
	return ""
}

// PlazaVideoPerSecondTier 模型广场按分辨率展示「¥/秒」参考单价（有声默认定价，与 tierAddPerSec 一致）。
type PlazaVideoPerSecondTier struct {
	Label        string  `json:"label"`
	USDPerSecond float64 `json:"usd_per_second"`
}

// effectiveUSDPerSecondForKey 分辨率配置键对应的每秒美元单价（含规则级 USDPerSecond）。
func effectiveUSDPerSecondForKey(rule VideoPricingRule, key string) float64 {
	k := strings.TrimSpace(key)
	return rule.USDPerSecond + tierAddPerSec(rule, k, nil)
}

func maxEffectiveUSDPerSecondForPLabel(rule VideoPricingRule, pLabel string) float64 {
	pLabel = strings.TrimSpace(pLabel)
	if pLabel == "" {
		return effectiveUSDPerSecondForKey(rule, "")
	}
	var maxR float64
	found := false
	seen := map[string]struct{}{}
	tryKey := func(k string) {
		k = strings.TrimSpace(k)
		if k == "" {
			return
		}
		if _, dup := seen[k]; dup {
			return
		}
		lb := inferResolutionPLabel(k)
		if !strings.EqualFold(lb, pLabel) {
			return
		}
		seen[k] = struct{}{}
		r := effectiveUSDPerSecondForKey(rule, k)
		if !found || r > maxR {
			maxR = r
			found = true
		}
	}
	for k := range rule.ResolutionTierUSDPerSecond {
		tryKey(k)
	}
	for k := range rule.ResolutionUSDPerSecond {
		tryKey(k)
	}
	if found {
		return maxR
	}
	// 无匹配档位键时退回按标签字符串解析（如仅配了 720p 键名）
	return effectiveUSDPerSecondForKey(rule, strings.ToLower(pLabel))
}

// BuildPlazaVideoPerSecondTiers 供 /api/pricing 模型广场卡片「720P xxx/秒」展示。
func BuildPlazaVideoPerSecondTiers(modelName string) []PlazaVideoPerSecondTier {
	rule, ok := GetVideoPricingRule(modelName)
	if !ok || !rule.Enabled {
		return nil
	}
	hints := BuildVideoTierHints(modelName)
	if hints == nil {
		return nil
	}
	var out []PlazaVideoPerSecondTier
	for _, lbl := range hints.ResolutionLabels {
		lbl = strings.TrimSpace(lbl)
		if lbl == "" {
			continue
		}
		r := maxEffectiveUSDPerSecondForPLabel(rule, lbl)
		if r > 0 {
			out = append(out, PlazaVideoPerSecondTier{Label: lbl, USDPerSecond: r})
		}
	}
	if len(out) == 0 {
		r := maxEffectiveUSDPerSecondForPLabel(rule, "")
		if r > 0 {
			out = append(out, PlazaVideoPerSecondTier{Label: "", USDPerSecond: r})
		}
	}
	if len(out) == 0 {
		return nil
	}
	return out
}

// BuildVideoTierHintsFromLabels 为仅需分辨率选择器（无视频复合秒价定价）的模型生成 VideoTierHints。
// CompositeEnabled 设为 true 使前端显示分辨率区；ShowVoicedOption/ShowSilentOption 为 false 则不显示音频切换。
func BuildVideoTierHintsFromLabels(resolutionLabels []string) *VideoTierHints {
	if len(resolutionLabels) == 0 {
		return nil
	}
	return &VideoTierHints{
		CompositeEnabled: true,
		ResolutionLabels: resolutionLabels,
	}
}

// BuildVideoTierHints 根据视频复合规则生成前端展示提示；无规则或未启用时返回 nil。
func BuildVideoTierHints(modelName string) *VideoTierHints {
	rule, ok := GetVideoPricingRule(modelName)
	if !ok || !rule.Enabled {
		return nil
	}
	h := &VideoTierHints{CompositeEnabled: true}
	labels := map[string]struct{}{}
	for k, tier := range rule.ResolutionTierUSDPerSecond {
		k = strings.TrimSpace(k)
		if k == "" {
			continue
		}
		if lbl := inferResolutionPLabel(k); lbl != "" {
			labels[lbl] = struct{}{}
		}
		if tier.VoicedUSDPerSecond > 0 {
			h.ShowVoicedOption = true
		}
		if tier.SilentUSDPerSecond > 0 {
			h.ShowSilentOption = true
		}
	}
	for k, v := range rule.ResolutionUSDPerSecond {
		k = strings.TrimSpace(k)
		if k == "" {
			continue
		}
		if lbl := inferResolutionPLabel(k); lbl != "" {
			labels[lbl] = struct{}{}
		}
		if v > 0 {
			h.ShowVoicedOption = true
			h.ShowSilentOption = true
		}
	}
	order := []string{"480P", "720P", "1080P"}
	for _, o := range order {
		if _, ok := labels[o]; ok {
			h.ResolutionLabels = append(h.ResolutionLabels, o)
		}
	}
	return h
}

// ComputeVideoPricingUSD 计算单次视频请求折合美元总价（不含分组倍率；分组在 quota 换算时乘）。
func ComputeVideoPricingUSD(rule VideoPricingRule, mapModelPriceUSD float64, seconds int, resolutionKey string, includeAudio *bool) float64 {
	total := 0.0
	if rule.IncludeModelPriceBase {
		total += mapModelPriceUSD
	}
	total += rule.ExtraBaseUSD
	if seconds < 0 {
		seconds = 0
	}
	sec := float64(seconds)
	ratePerSec := rule.USDPerSecond + tierAddPerSec(rule, resolutionKey, includeAudio)
	total += ratePerSec * sec
	return total
}
