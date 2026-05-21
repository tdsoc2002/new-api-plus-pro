package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// OAuthClient stores OAuth client application information
type OAuthClient struct {
	Id           int            `json:"id" gorm:"primaryKey"`
	ClientId     string         `json:"client_id" gorm:"type:varchar(64);uniqueIndex;not null"`
	ClientSecret string         `json:"-" gorm:"type:varchar(128);not null"` // bcrypt encrypted, never returned to frontend
	Name         string         `json:"name" gorm:"type:varchar(128);not null"`
	Description  string         `json:"description" gorm:"type:varchar(512)"`
	RedirectUris string         `json:"redirect_uris" gorm:"type:text;not null"` // JSON array of allowed redirect URIs
	Scopes       string         `json:"scopes" gorm:"type:varchar(256);default:'openid profile email'"`
	Enabled      bool           `json:"enabled" gorm:"default:true"`
	RequireHttps bool           `json:"require_https" gorm:"default:true"` // Whether to enforce HTTPS for redirect URIs
	UserId       int            `json:"user_id" gorm:"index;not null"`    // Creator user ID
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
}

func (OAuthClient) TableName() string {
	return "oauth_clients"
}

// GetAllOAuthClients returns all OAuth clients
func GetAllOAuthClients() ([]*OAuthClient, error) {
	var clients []*OAuthClient
	err := DB.Order("id desc").Find(&clients).Error
	return clients, err
}

// GetOAuthClientById returns an OAuth client by ID
func GetOAuthClientById(id int) (*OAuthClient, error) {
	var client OAuthClient
	err := DB.First(&client, id).Error
	if err != nil {
		return nil, err
	}
	return &client, nil
}

// GetOAuthClientByClientId returns an OAuth client by client_id
func GetOAuthClientByClientId(clientId string) (*OAuthClient, error) {
	var client OAuthClient
	err := DB.Where("client_id = ?", clientId).First(&client).Error
	if err != nil {
		return nil, err
	}
	return &client, nil
}

// CreateOAuthClient creates a new OAuth client
func CreateOAuthClient(client *OAuthClient) error {
	if err := validateOAuthClient(client); err != nil {
		return err
	}
	return DB.Create(client).Error
}

// UpdateOAuthClient updates an existing OAuth client
func UpdateOAuthClient(client *OAuthClient) error {
	if err := validateOAuthClient(client); err != nil {
		return err
	}
	return DB.Save(client).Error
}

// DeleteOAuthClient deletes an OAuth client by ID
func DeleteOAuthClient(id int) error {
	return DB.Delete(&OAuthClient{}, id).Error
}

// IsClientIdTaken checks if a client_id is already taken
func IsClientIdTaken(clientId string, excludeId int) bool {
	var count int64
	query := DB.Model(&OAuthClient{}).Where("client_id = ?", clientId)
	if excludeId > 0 {
		query = query.Where("id != ?", excludeId)
	}
	res := query.Count(&count)
	if res.Error != nil {
		return true // Fail-closed
	}
	return count > 0
}

// validateOAuthClient validates an OAuth client configuration
func validateOAuthClient(client *OAuthClient) error {
	if client.Name == "" {
		return errors.New("client name is required")
	}
	if client.ClientId == "" {
		return errors.New("client_id is required")
	}
	if client.ClientSecret == "" {
		return errors.New("client_secret is required")
	}
	if client.RedirectUris == "" {
		return errors.New("redirect_uris is required")
	}
	if client.UserId == 0 {
		return errors.New("user_id is required")
	}
	return nil
}
