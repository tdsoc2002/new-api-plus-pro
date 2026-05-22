package ratio_setting

import "testing"

func assertFloatNear(t *testing.T, got, want float64) {
	t.Helper()
	if got < want-0.0000001 || got > want+0.0000001 {
		t.Fatalf("expected %.6f, got %.6f", want, got)
	}
}

func TestComputeVideoPricingUSDUsesResolutionAndAudioTier(t *testing.T) {
	rule := VideoPricingRule{
		Enabled:               true,
		IncludeModelPriceBase: true,
		ExtraBaseUSD:          0.01,
		USDPerSecond:          0.02,
		ResolutionTierUSDPerSecond: map[string]VideoResolutionTierUSD{
			"720p": {
				VoicedUSDPerSecond: 0.03,
				SilentUSDPerSecond: 0.01,
			},
		},
	}

	withAudio := true
	got := ComputeVideoPricingUSD(rule, 0.10, 5, "1280*720", &withAudio)
	assertFloatNear(t, got, 0.36)

	withoutAudio := false
	got = ComputeVideoPricingUSD(rule, 0.10, 5, "720P", &withoutAudio)
	assertFloatNear(t, got, 0.26)
}

func TestVideoPricingRulesLookupAndHints(t *testing.T) {
	t.Cleanup(func() {
		_ = UpdateVideoPricingRulesByJSONString("{}")
	})

	err := UpdateVideoPricingRulesByJSONString(`{
		"seedance-2": {
			"enabled": true,
			"resolution_tier_usd_per_second": {
				"720p": {
					"voiced_usd_per_second": 0.08,
					"silent_usd_per_second": 0.06
				}
			},
			"default_seconds": 5
		}
	}`)
	if err != nil {
		t.Fatal(err)
	}

	rule, ok := GetVideoPricingRule("seedance-2")
	if !ok || !rule.Enabled {
		t.Fatalf("expected enabled seedance-2 rule, got %#v, %v", rule, ok)
	}

	hints := BuildVideoTierHints("seedance-2")
	if hints == nil || !hints.CompositeEnabled {
		t.Fatalf("expected composite hints, got %#v", hints)
	}
	if len(hints.ResolutionLabels) != 1 || hints.ResolutionLabels[0] != "720P" {
		t.Fatalf("expected 720P label, got %#v", hints.ResolutionLabels)
	}
	if !hints.ShowVoicedOption || !hints.ShowSilentOption {
		t.Fatalf("expected voiced and silent options, got %#v", hints)
	}
}
