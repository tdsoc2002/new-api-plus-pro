package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

const (
	SeedanceAssetStatusProcessing = "Processing"
	SeedanceAssetStatusActive     = "Active"
	SeedanceAssetStatusFailed     = "Failed"

	SeedanceAssetStorageProviderExternal = "external"
	SeedanceAssetStorageProviderTOS      = "tos"
)

type SeedanceAssetGroup struct {
	ID          int64  `json:"id" gorm:"primary_key;AUTO_INCREMENT"`
	UserID      int    `json:"user_id" gorm:"index;not null"`
	ChannelID   int    `json:"channel_id" gorm:"index;not null"`
	OfficialID  string `json:"official_id" gorm:"type:varchar(191);index;not null"`
	Name        string `json:"name" gorm:"type:varchar(255);not null"`
	Description string `json:"description" gorm:"type:text"`
	CreatedAt   int64  `json:"created_at" gorm:"index"`
	UpdatedAt   int64  `json:"updated_at"`
}

type SeedanceAsset struct {
	ID              int64  `json:"id" gorm:"primary_key;AUTO_INCREMENT"`
	UserID          int    `json:"user_id" gorm:"index;not null"`
	GroupID         int64  `json:"group_id" gorm:"index;not null"`
	ChannelID       int    `json:"channel_id" gorm:"index;not null"`
	OfficialID      string `json:"official_id" gorm:"type:varchar(191);index;not null"`
	Name            string `json:"name" gorm:"type:varchar(255)"`
	Status          string `json:"status" gorm:"type:varchar(40);index"`
	FailReason      string `json:"fail_reason" gorm:"type:text"`
	SourceURL       string `json:"source_url" gorm:"type:text"`
	PreviewURL      string `json:"preview_url" gorm:"type:text"`
	StorageProvider string `json:"storage_provider" gorm:"type:varchar(32);default:'external'"`
	StorageBucket   string `json:"storage_bucket" gorm:"type:varchar(128)"`
	StorageKey      string `json:"storage_key" gorm:"type:varchar(512);index"`
	ContentType     string `json:"content_type" gorm:"type:varchar(128)"`
	SizeBytes       int64  `json:"size_bytes" gorm:"bigint;default:0"`
	DeletedAt       int64  `json:"deleted_at" gorm:"index;default:0"`
	CreatedAt       int64  `json:"created_at" gorm:"index"`
	UpdatedAt       int64  `json:"updated_at"`
	LastSyncedAt    int64  `json:"last_synced_at" gorm:"index"`
}

type UserAssetStorage struct {
	UserID     int   `json:"user_id" gorm:"primary_key"`
	UsedBytes  int64 `json:"used_bytes" gorm:"bigint;default:0"`
	LimitBytes int64 `json:"limit_bytes" gorm:"bigint;default:0"`
	UpdatedAt  int64 `json:"updated_at"`
}

func EnsureUserAssetStorage(userID int, defaultLimitBytes int64) (*UserAssetStorage, error) {
	now := time.Now().Unix()
	storage := &UserAssetStorage{UserID: userID}
	err := DB.FirstOrCreate(storage, UserAssetStorage{
		UserID:     userID,
		LimitBytes: defaultLimitBytes,
		UpdatedAt:  now,
	}).Error
	if err != nil {
		return nil, err
	}
	if storage.LimitBytes == 0 && defaultLimitBytes > 0 {
		storage.LimitBytes = defaultLimitBytes
		storage.UpdatedAt = now
		if err := DB.Save(storage).Error; err != nil {
			return nil, err
		}
	}
	return storage, nil
}

func ReserveUserAssetStorage(userID int, sizeBytes int64, defaultLimitBytes int64) error {
	if sizeBytes <= 0 {
		return nil
	}
	storage, err := EnsureUserAssetStorage(userID, defaultLimitBytes)
	if err != nil {
		return err
	}
	limit := storage.LimitBytes
	if limit <= 0 {
		limit = defaultLimitBytes
	}
	q := DB.Model(&UserAssetStorage{}).Where("user_id = ?", userID)
	if limit > 0 {
		q = q.Where("used_bytes + ? <= ?", sizeBytes, limit)
	}
	res := q.Updates(map[string]any{
		"used_bytes": gorm.Expr("used_bytes + ?", sizeBytes),
		"updated_at": time.Now().Unix(),
	})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("asset storage quota exceeded")
	}
	return nil
}

func ReleaseUserAssetStorage(userID int, sizeBytes int64) error {
	if sizeBytes <= 0 {
		return nil
	}
	return DB.Model(&UserAssetStorage{}).
		Where("user_id = ?", userID).
		Updates(map[string]any{
			"used_bytes": gorm.Expr("CASE WHEN used_bytes >= ? THEN used_bytes - ? ELSE 0 END", sizeBytes, sizeBytes),
			"updated_at": time.Now().Unix(),
		}).Error
}

func GetSeedanceAssetByOfficialID(userID int, officialID string) (*SeedanceAsset, error) {
	var asset SeedanceAsset
	err := DB.Where("user_id = ? AND official_id = ? AND deleted_at = 0", userID, officialID).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}
