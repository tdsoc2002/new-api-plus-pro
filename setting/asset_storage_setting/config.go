package asset_storage_setting

import "github.com/QuantumNous/new-api/setting/config"

type AssetStorageSetting struct {
	Enabled                  bool   `json:"enabled"`
	Provider                 string `json:"provider"`
	DefaultLimitBytes        int64  `json:"default_limit_bytes"`
	MaxFileSizeBytes         int64  `json:"max_file_size_bytes"`
	AllowedMimeTypes         string `json:"allowed_mime_types"`
	TOSAccessKey             string `json:"tos_access_key"`
	TOSSecretKey             string `json:"tos_secret_key"`
	TOSSecurityToken         string `json:"tos_security_token"`
	TOSEndpoint              string `json:"tos_endpoint"`
	TOSRegion                string `json:"tos_region"`
	TOSBucket                string `json:"tos_bucket"`
	TOSPublicBaseURL         string `json:"tos_public_base_url"`
	TOSKeyPrefix             string `json:"tos_key_prefix"`
	SeedanceDefaultModel     string `json:"seedance_default_model"`
	SeedanceDefaultGroupName string `json:"seedance_default_group_name"`
}

var assetStorageSetting = AssetStorageSetting{
	Enabled:                  false,
	Provider:                 "tos",
	DefaultLimitBytes:        1024 * 1024 * 1024,
	MaxFileSizeBytes:         100 * 1024 * 1024,
	AllowedMimeTypes:         "image/jpeg,image/png,image/webp,video/mp4,video/quicktime",
	TOSKeyPrefix:             "seedance-assets",
	SeedanceDefaultModel:     "seedance-2",
	SeedanceDefaultGroupName: "Default Library",
}

func init() {
	config.GlobalConfig.Register("asset_storage_setting", &assetStorageSetting)
}

func GetSetting() AssetStorageSetting {
	return assetStorageSetting
}
