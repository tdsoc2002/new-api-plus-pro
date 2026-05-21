package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// OAuthAccessToken stores access tokens and refresh tokens
type OAuthAccessToken struct {
	Id               int       `json:"id" gorm:"primaryKey"`
	AccessToken      string    `json:"access_token" gorm:"type:varchar(64);uniqueIndex;not null"`
	RefreshToken     string    `json:"refresh_token" gorm:"type:varchar(64);uniqueIndex"`
	ClientId         string    `json:"client_id" gorm:"type:varchar(64);index;not null"`
	UserId           int       `json:"user_id" gorm:"index;not null"`
	Scopes           string    `json:"scopes" gorm:"type:varchar(256)"`
	ExpiresAt        time.Time `json:"expires_at" gorm:"index"`
	RefreshExpiresAt time.Time `json:"refresh_expires_at" gorm:"index"`
	CreatedAt        time.Time `json:"created_at"`
}

func (OAuthAccessToken) TableName() string {
	return "oauth_access_tokens"
}

// CreateAccessToken creates a new access token
func CreateAccessToken(token *OAuthAccessToken) error {
	if token.AccessToken == "" {
		return errors.New("access_token is required")
	}
	if token.ClientId == "" {
		return errors.New("client_id is required")
	}
	if token.UserId == 0 {
		return errors.New("user_id is required")
	}
	return DB.Create(token).Error
}

// ValidateOAuthAccessToken validates an OAuth access token
// Returns the token record if valid, error if invalid or expired
func ValidateOAuthAccessToken(accessToken string) (*OAuthAccessToken, error) {
	var token OAuthAccessToken
	err := DB.Where("access_token = ? AND expires_at > ?", accessToken, time.Now()).
		First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid or expired access token")
		}
		return nil, err
	}
	return &token, nil
}

// GetAccessTokenByRefreshToken retrieves an access token by refresh token
func GetAccessTokenByRefreshToken(refreshToken string) (*OAuthAccessToken, error) {
	var token OAuthAccessToken
	err := DB.Where("refresh_token = ? AND refresh_expires_at > ?", refreshToken, time.Now()).
		First(&token).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid or expired refresh token")
		}
		return nil, err
	}
	return &token, nil
}

// RevokeAccessToken revokes an access token
func RevokeAccessToken(accessToken string) error {
	return DB.Where("access_token = ?", accessToken).Delete(&OAuthAccessToken{}).Error
}

// RevokeAccessTokensByClientAndUser revokes all access tokens for a client and user
func RevokeAccessTokensByClientAndUser(clientId string, userId int) error {
	return DB.Where("client_id = ? AND user_id = ?", clientId, userId).Delete(&OAuthAccessToken{}).Error
}

// CleanupExpiredAccessTokens deletes expired access tokens
func CleanupExpiredAccessTokens() error {
	return DB.Where("expires_at < ? AND refresh_expires_at < ?", time.Now(), time.Now()).
		Delete(&OAuthAccessToken{}).Error
}
