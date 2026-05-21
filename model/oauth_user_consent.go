package model

import (
	"errors"
	"time"
)

// OAuthUserConsent stores user authorization records to avoid repeated authorization prompts
type OAuthUserConsent struct {
	Id        int       `json:"id" gorm:"primaryKey"`
	UserId    int       `json:"user_id" gorm:"not null;uniqueIndex:ux_user_client"`
	ClientId  string    `json:"client_id" gorm:"type:varchar(64);not null;uniqueIndex:ux_user_client"`
	Scopes    string    `json:"scopes" gorm:"type:varchar(256)"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (OAuthUserConsent) TableName() string {
	return "oauth_user_consents"
}

// GetUserConsent retrieves user consent for a specific client
func GetUserConsent(userId int, clientId string) (*OAuthUserConsent, error) {
	var consent OAuthUserConsent
	err := DB.Where("user_id = ? AND client_id = ?", userId, clientId).First(&consent).Error
	if err != nil {
		return nil, err
	}
	return &consent, nil
}

// CreateOrUpdateUserConsent creates or updates user consent
func CreateOrUpdateUserConsent(consent *OAuthUserConsent) error {
	if consent.UserId == 0 {
		return errors.New("user_id is required")
	}
	if consent.ClientId == "" {
		return errors.New("client_id is required")
	}

	// Check if consent already exists
	existing, err := GetUserConsent(consent.UserId, consent.ClientId)
	if err == nil {
		// Update existing consent
		existing.Scopes = consent.Scopes
		existing.UpdatedAt = time.Now()
		return DB.Save(existing).Error
	}

	// Create new consent
	return DB.Create(consent).Error
}

// RevokeUserConsent revokes user consent for a specific client
func RevokeUserConsent(userId int, clientId string) error {
	return DB.Where("user_id = ? AND client_id = ?", userId, clientId).Delete(&OAuthUserConsent{}).Error
}

// GetUserConsentsByUserId retrieves all consents for a user
func GetUserConsentsByUserId(userId int) ([]*OAuthUserConsent, error) {
	var consents []*OAuthUserConsent
	err := DB.Where("user_id = ?", userId).Order("created_at desc").Find(&consents).Error
	return consents, err
}
