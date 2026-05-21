package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// OAuthAuthorizationCode stores temporary authorization codes (one-time use)
type OAuthAuthorizationCode struct {
	Id                  int       `json:"id" gorm:"primaryKey"`
	Code                string    `json:"code" gorm:"type:varchar(64);uniqueIndex;not null"`
	ClientId            string    `json:"client_id" gorm:"type:varchar(64);index;not null"`
	UserId              int       `json:"user_id" gorm:"index;not null"`
	RedirectUri         string    `json:"redirect_uri" gorm:"type:varchar(512);not null"`
	Scopes              string    `json:"scopes" gorm:"type:varchar(256)"`
	CodeChallenge       string    `json:"code_challenge" gorm:"type:varchar(128)"`       // PKCE support
	CodeChallengeMethod string    `json:"code_challenge_method" gorm:"type:varchar(16)"` // S256 or plain
	Used                bool      `json:"used" gorm:"default:false;index"`
	ExpiresAt           time.Time `json:"expires_at" gorm:"index"`
	CreatedAt           time.Time `json:"created_at"`
}

func (OAuthAuthorizationCode) TableName() string {
	return "oauth_authorization_codes"
}

// CreateAuthorizationCode creates a new authorization code
func CreateAuthorizationCode(code *OAuthAuthorizationCode) error {
	if code.Code == "" {
		return errors.New("code is required")
	}
	if code.ClientId == "" {
		return errors.New("client_id is required")
	}
	if code.UserId == 0 {
		return errors.New("user_id is required")
	}
	if code.RedirectUri == "" {
		return errors.New("redirect_uri is required")
	}
	return DB.Create(code).Error
}

// ConsumeAuthorizationCode validates and marks an authorization code as used (one-time use)
// Returns error if code is invalid, expired, or already used
func ConsumeAuthorizationCode(code string, clientId string, redirectUri string) (*OAuthAuthorizationCode, error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var authCode OAuthAuthorizationCode
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("code = ? AND client_id = ? AND redirect_uri = ? AND used = ? AND expires_at > ?",
			code, clientId, redirectUri, false, time.Now()).
		First(&authCode).Error

	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid or expired authorization code")
		}
		return nil, err
	}

	// Mark as used
	authCode.Used = true
	if err := tx.Save(&authCode).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return &authCode, nil
}

// CleanupExpiredAuthorizationCodes deletes expired authorization codes
func CleanupExpiredAuthorizationCodes() error {
	return DB.Where("expires_at < ?", time.Now()).Delete(&OAuthAuthorizationCode{}).Error
}
