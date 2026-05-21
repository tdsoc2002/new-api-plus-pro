package controller

import (
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// OAuthClientResponse is the response structure for OAuth clients (excludes client_secret)
type OAuthClientResponse struct {
	Id           int       `json:"id"`
	ClientId     string    `json:"client_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	RedirectUris string    `json:"redirect_uris"`
	Scopes       string    `json:"scopes"`
	Enabled      bool      `json:"enabled"`
	RequireHttps bool      `json:"require_https"`
	UserId       int       `json:"user_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func toOAuthClientResponse(client *model.OAuthClient) *OAuthClientResponse {
	return &OAuthClientResponse{
		Id:           client.Id,
		ClientId:     client.ClientId,
		Name:         client.Name,
		Description:  client.Description,
		RedirectUris: client.RedirectUris,
		Scopes:       client.Scopes,
		Enabled:      client.Enabled,
		RequireHttps: client.RequireHttps,
		UserId:       client.UserId,
		CreatedAt:    client.CreatedAt,
		UpdatedAt:    client.UpdatedAt,
	}
}

// GetOAuthClients returns all OAuth clients
func GetOAuthClients(c *gin.Context) {
	clients, err := model.GetAllOAuthClients()
	if err != nil {
		common.ApiError(c, err)
		return
	}

	response := make([]*OAuthClientResponse, len(clients))
	for i, client := range clients {
		response[i] = toOAuthClientResponse(client)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    response,
	})
}

// GetOAuthClient returns a single OAuth client by ID
func GetOAuthClient(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ApiErrorMsg(c, "无效的 ID")
		return
	}

	client, err := model.GetOAuthClientById(id)
	if err != nil {
		common.ApiErrorMsg(c, "未找到该 OAuth 客户端")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    toOAuthClientResponse(client),
	})
}

// CreateOAuthClientRequest is the request structure for creating an OAuth client
type CreateOAuthClientRequest struct {
	Name         string `json:"name" binding:"required"`
	Description  string `json:"description"`
	RedirectUris string `json:"redirect_uris" binding:"required"`
	Scopes       string `json:"scopes"`
	RequireHttps *bool  `json:"require_https"` // Pointer to distinguish between false and not provided
}

// CreateOAuthClient creates a new OAuth client
func CreateOAuthClient(c *gin.Context) {
	var req CreateOAuthClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorMsg(c, "无效的请求参数: "+err.Error())
		return
	}

	userId := c.GetInt("id")
	if userId == 0 {
		common.ApiErrorMsg(c, "未登录")
		return
	}

	// Generate client_id and client_secret
	clientId, err := common.GenerateRandomKey(32)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	clientSecret, err := common.GenerateRandomKey(32)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	// Hash client_secret with bcrypt
	hashedSecret, err := common.Password2Hash(clientSecret)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	client := &model.OAuthClient{
		ClientId:     clientId,
		ClientSecret: hashedSecret,
		Name:         req.Name,
		Description:  req.Description,
		RedirectUris: req.RedirectUris,
		Scopes:       req.Scopes,
		Enabled:      true,
		RequireHttps: req.RequireHttps != nil && *req.RequireHttps, // Default to false if not provided
		UserId:       userId,
	}

	if err := model.CreateOAuthClient(client); err != nil {
		common.ApiError(c, err)
		return
	}

	// Return response with plain client_secret (only shown once)
	response := toOAuthClientResponse(client)
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "创建成功",
		"data":          response,
		"client_secret": clientSecret, // Only returned on creation
	})
}

// UpdateOAuthClientRequest is the request structure for updating an OAuth client
type UpdateOAuthClientRequest struct {
	Name         string `json:"name"`
	Description  string `json:"description"`
	RedirectUris string `json:"redirect_uris"`
	Scopes       string `json:"scopes"`
	Enabled      *bool  `json:"enabled"`
	RequireHttps *bool  `json:"require_https"`
}

// UpdateOAuthClient updates an existing OAuth client
func UpdateOAuthClient(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ApiErrorMsg(c, "无效的 ID")
		return
	}

	var req UpdateOAuthClientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorMsg(c, "无效的请求参数: "+err.Error())
		return
	}

	client, err := model.GetOAuthClientById(id)
	if err != nil {
		common.ApiErrorMsg(c, "未找到该 OAuth 客户端")
		return
	}

	// Update fields
	if req.Name != "" {
		client.Name = req.Name
	}
	if req.Description != "" {
		client.Description = req.Description
	}
	if req.RedirectUris != "" {
		client.RedirectUris = req.RedirectUris
	}
	if req.Scopes != "" {
		client.Scopes = req.Scopes
	}
	if req.Enabled != nil {
		client.Enabled = *req.Enabled
	}
	if req.RequireHttps != nil {
		client.RequireHttps = *req.RequireHttps
	}

	if err := model.UpdateOAuthClient(client); err != nil {
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新成功",
		"data":    toOAuthClientResponse(client),
	})
}

// DeleteOAuthClient deletes an OAuth client
func DeleteOAuthClient(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ApiErrorMsg(c, "无效的 ID")
		return
	}

	if err := model.DeleteOAuthClient(id); err != nil {
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}

// RegenerateClientSecret regenerates the client_secret for an OAuth client
func RegenerateClientSecret(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		common.ApiErrorMsg(c, "无效的 ID")
		return
	}

	client, err := model.GetOAuthClientById(id)
	if err != nil {
		common.ApiErrorMsg(c, "未找到该 OAuth 客户端")
		return
	}

	// Generate new client_secret
	clientSecret, err := common.GenerateRandomKey(32)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	// Hash new client_secret
	hashedSecret, err := common.Password2Hash(clientSecret)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	client.ClientSecret = hashedSecret
	if err := model.UpdateOAuthClient(client); err != nil {
		common.ApiError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "重新生成成功",
		"client_secret": clientSecret, // Only returned once
	})
}

// OAuth Authorization Flow

// OAuthAuthorize handles GET /oauth2/authorize - displays authorization page
func OAuthAuthorize(c *gin.Context) {
	clientId := c.Query("client_id")
	redirectUri := c.Query("redirect_uri")
	responseType := c.Query("response_type")
	scope := c.Query("scope")
	state := c.Query("state")
	codeChallenge := c.Query("code_challenge")
	codeChallengeMethod := c.Query("code_challenge_method")

	// Validate required parameters
	if clientId == "" || redirectUri == "" || responseType == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_request",
			"error_description": "Missing required parameters",
		})
		return
	}

	if responseType != "code" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "unsupported_response_type",
			"error_description": "Only 'code' response type is supported",
		})
		return
	}

	// Validate client
	client, err := model.GetOAuthClientByClientId(clientId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_client",
			"error_description": "Client not found",
		})
		return
	}

	if !client.Enabled {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "unauthorized_client",
			"error_description": "Client is disabled",
		})
		return
	}

	// Validate redirect_uri
	if !validateRedirectUri(client, redirectUri) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_request",
			"error_description": "Invalid redirect_uri",
		})
		return
	}

	// Check HTTPS requirement if enabled for this client
	if client.RequireHttps && !strings.HasPrefix(redirectUri, "https://") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_request",
			"error_description": "This client requires HTTPS redirect URIs",
		})
		return
	}

	// Validate scopes
	validatedScopes, err := validateScopes(scope)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_scope",
			"error_description": err.Error(),
		})
		return
	}

	// Get user ID from session
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "login_required",
			"error_description": "User must be logged in",
		})
		return
	}

	// Check if user has already consented
	consent, _ := model.GetUserConsent(userId, clientId)
	if consent != nil {
		// User has already consented, generate authorization code directly
		code, err := generateAuthorizationCode(clientId, userId, redirectUri, validatedScopes, codeChallenge, codeChallengeMethod)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":             "server_error",
				"error_description": "Failed to generate authorization code",
			})
			return
		}

		// Redirect to redirect_uri with code
		redirectUrl := redirectUri + "?code=" + code
		if state != "" {
			redirectUrl += "&state=" + state
		}
		c.Redirect(http.StatusFound, redirectUrl)
		return
	}

	// Return authorization page data
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"client_id":              clientId,
			"client_name":            client.Name,
			"client_description":     client.Description,
			"redirect_uri":           redirectUri,
			"scope":                  validatedScopes,
			"state":                  state,
			"code_challenge":         codeChallenge,
			"code_challenge_method":  codeChallengeMethod,
		},
	})
}

// OAuthAuthorizePost handles POST /oauth2/authorize - user confirms authorization
func OAuthAuthorizePost(c *gin.Context) {
	var req struct {
		ClientId            string `json:"client_id" binding:"required"`
		RedirectUri         string `json:"redirect_uri" binding:"required"`
		Scope               string `json:"scope"`
		State               string `json:"state"`
		CodeChallenge       string `json:"code_challenge"`
		CodeChallengeMethod string `json:"code_challenge_method"`
		Approved            bool   `json:"approved"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorMsg(c, "无效的请求参数: "+err.Error())
		return
	}

	userId := c.GetInt("id")
	if userId == 0 {
		common.ApiErrorMsg(c, "未登录")
		return
	}

	// If user denied authorization
	if !req.Approved {
		redirectUrl := req.RedirectUri + "?error=access_denied&error_description=User+denied+authorization"
		if req.State != "" {
			redirectUrl += "&state=" + req.State
		}
		c.JSON(http.StatusOK, gin.H{
			"success":      true,
			"redirect_url": redirectUrl,
		})
		return
	}

	// Validate client
	client, err := model.GetOAuthClientByClientId(req.ClientId)
	if err != nil {
		common.ApiErrorMsg(c, "客户端不存在")
		return
	}

	if !validateRedirectUri(client, req.RedirectUri) {
		common.ApiErrorMsg(c, "无效的 redirect_uri")
		return
	}

	validatedScopes, err := validateScopes(req.Scope)
	if err != nil {
		common.ApiErrorMsg(c, err.Error())
		return
	}

	// Save user consent
	consent := &model.OAuthUserConsent{
		UserId:   userId,
		ClientId: req.ClientId,
		Scopes:   validatedScopes,
	}
	_ = model.CreateOrUpdateUserConsent(consent)

	// Generate authorization code
	code, err := generateAuthorizationCode(req.ClientId, userId, req.RedirectUri, validatedScopes, req.CodeChallenge, req.CodeChallengeMethod)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	// Build redirect URL
	redirectUrl := req.RedirectUri + "?code=" + code
	if req.State != "" {
		redirectUrl += "&state=" + req.State
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"redirect_url": redirectUrl,
	})
}

// OAuthToken handles POST /oauth2/token - token exchange
func OAuthToken(c *gin.Context) {
	grantType := c.PostForm("grant_type")

	switch grantType {
	case "authorization_code":
		handleAuthorizationCodeGrant(c)
	case "refresh_token":
		handleRefreshTokenGrant(c)
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "unsupported_grant_type",
			"error_description": "Only authorization_code and refresh_token grant types are supported",
		})
	}
}

func handleAuthorizationCodeGrant(c *gin.Context) {
	code := c.PostForm("code")
	clientId := c.PostForm("client_id")
	clientSecret := c.PostForm("client_secret")
	redirectUri := c.PostForm("redirect_uri")
	codeVerifier := c.PostForm("code_verifier")

	if code == "" || clientId == "" || clientSecret == "" || redirectUri == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_request",
			"error_description": "Missing required parameters",
		})
		return
	}

	// Validate client credentials
	client, err := model.GetOAuthClientByClientId(clientId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_client",
			"error_description": "Client authentication failed",
		})
		return
	}

	if !common.ValidatePasswordAndHash(clientSecret, client.ClientSecret) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_client",
			"error_description": "Client authentication failed",
		})
		return
	}

	// Consume authorization code (one-time use)
	authCode, err := model.ConsumeAuthorizationCode(code, clientId, redirectUri)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_grant",
			"error_description": "Invalid or expired authorization code",
		})
		return
	}

	// Validate PKCE if code_challenge was provided
	if authCode.CodeChallenge != "" {
		if codeVerifier == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":             "invalid_request",
				"error_description": "code_verifier is required",
			})
			return
		}
		if !validatePKCE(codeVerifier, authCode.CodeChallenge, authCode.CodeChallengeMethod) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":             "invalid_grant",
				"error_description": "PKCE validation failed",
			})
			return
		}
	}

	// Generate access token and refresh token
	accessToken, err := common.GenerateRandomKey(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "server_error",
			"error_description": "Failed to generate access token",
		})
		return
	}

	refreshToken, err := common.GenerateRandomKey(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "server_error",
			"error_description": "Failed to generate refresh token",
		})
		return
	}

	// Save tokens to database
	tokenRecord := &model.OAuthAccessToken{
		AccessToken:      accessToken,
		RefreshToken:     refreshToken,
		ClientId:         clientId,
		UserId:           authCode.UserId,
		Scopes:           authCode.Scopes,
		ExpiresAt:        time.Now().Add(1 * time.Hour),
		RefreshExpiresAt: time.Now().Add(30 * 24 * time.Hour),
	}

	if err := model.CreateAccessToken(tokenRecord); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "server_error",
			"error_description": "Failed to save access token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"token_type":    "Bearer",
		"expires_in":    3600,
		"refresh_token": refreshToken,
		"scope":         authCode.Scopes,
	})
}

func handleRefreshTokenGrant(c *gin.Context) {
	refreshToken := c.PostForm("refresh_token")
	clientId := c.PostForm("client_id")
	clientSecret := c.PostForm("client_secret")

	if refreshToken == "" || clientId == "" || clientSecret == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_request",
			"error_description": "Missing required parameters",
		})
		return
	}

	// Validate client credentials
	client, err := model.GetOAuthClientByClientId(clientId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_client",
			"error_description": "Client authentication failed",
		})
		return
	}

	if !common.ValidatePasswordAndHash(clientSecret, client.ClientSecret) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_client",
			"error_description": "Client authentication failed",
		})
		return
	}

	// Validate refresh token
	oldToken, err := model.GetAccessTokenByRefreshToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_grant",
			"error_description": "Invalid or expired refresh token",
		})
		return
	}

	// Generate new access token
	newAccessToken, err := common.GenerateRandomKey(32)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "server_error",
			"error_description": "Failed to generate access token",
		})
		return
	}

	// Update token record
	oldToken.AccessToken = newAccessToken
	oldToken.ExpiresAt = time.Now().Add(1 * time.Hour)

	if err := model.CreateAccessToken(oldToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "server_error",
			"error_description": "Failed to save access token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  newAccessToken,
		"token_type":    "Bearer",
		"expires_in":    3600,
		"refresh_token": refreshToken,
		"scope":         oldToken.Scopes,
	})
}

// OAuthUserInfo handles GET /oauth2/userinfo - returns user information
func OAuthUserInfo(c *gin.Context) {
	userId := c.GetInt("oauth_user_id")
	scopes := c.GetString("oauth_scopes")

	if userId == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_token",
			"error_description": "Invalid access token",
		})
		return
	}

	user, err := model.GetUserById(userId, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":             "server_error",
			"error_description": "Failed to retrieve user information",
		})
		return
	}

	// Build response based on scopes
	scopeList := strings.Split(scopes, " ")
	response := gin.H{
		"sub": strconv.Itoa(user.Id),
	}

	if hasScope(scopeList, "profile") {
		response["preferred_username"] = user.Username
		response["name"] = user.DisplayName
		if user.DisplayName == "" {
			response["name"] = user.Username
		}
	}

	if hasScope(scopeList, "email") {
		response["email"] = user.Email
		response["email_verified"] = user.Email != ""
	}

	c.JSON(http.StatusOK, response)
}

// OAuthRevoke handles POST /oauth2/revoke - revokes a token
func OAuthRevoke(c *gin.Context) {
	token := c.PostForm("token")
	clientId := c.PostForm("client_id")
	clientSecret := c.PostForm("client_secret")

	if token == "" || clientId == "" || clientSecret == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":             "invalid_request",
			"error_description": "Missing required parameters",
		})
		return
	}

	// Validate client credentials
	client, err := model.GetOAuthClientByClientId(clientId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_client",
			"error_description": "Client authentication failed",
		})
		return
	}

	if !common.ValidatePasswordAndHash(clientSecret, client.ClientSecret) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":             "invalid_client",
			"error_description": "Client authentication failed",
		})
		return
	}

	// Revoke token
	_ = model.RevokeAccessToken(token)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

// User Authorization Management

// GetUserAuthorizations returns all OAuth authorizations for the current user
func GetUserAuthorizations(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		common.ApiErrorMsg(c, "未登录")
		return
	}

	consents, err := model.GetUserConsentsByUserId(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	response := make([]gin.H, 0, len(consents))
	for _, consent := range consents {
		client, err := model.GetOAuthClientByClientId(consent.ClientId)
		if err != nil {
			continue
		}

		response = append(response, gin.H{
			"client_id":   consent.ClientId,
			"client_name": client.Name,
			"scopes":      consent.Scopes,
			"created_at":  consent.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// RevokeUserAuthorization revokes user authorization for a specific client
func RevokeUserAuthorization(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		common.ApiErrorMsg(c, "未登录")
		return
	}

	clientId := c.Param("client_id")
	if clientId == "" {
		common.ApiErrorMsg(c, "client_id 不能为空")
		return
	}

	// Revoke consent
	if err := model.RevokeUserConsent(userId, clientId); err != nil {
		common.ApiError(c, err)
		return
	}

	// Revoke all access tokens for this client and user
	_ = model.RevokeAccessTokensByClientAndUser(clientId, userId)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "撤销成功",
	})
}

// Helper functions

func validateRedirectUri(client *model.OAuthClient, redirectUri string) bool {
	var allowedUris []string
	if err := common.Unmarshal([]byte(client.RedirectUris), &allowedUris); err != nil {
		// If not JSON array, treat as single URI
		return client.RedirectUris == redirectUri
	}

	for _, uri := range allowedUris {
		if uri == redirectUri {
			return true
		}
	}
	return false
}

var validScopes = map[string]bool{
	"openid":  true,
	"profile": true,
	"email":   true,
}

func validateScopes(requestedScopes string) (string, error) {
	if requestedScopes == "" {
		return "openid profile email", nil
	}

	scopes := strings.Split(requestedScopes, " ")
	validatedScopes := []string{}

	for _, scope := range scopes {
		scope = strings.TrimSpace(scope)
		if scope != "" && validScopes[scope] {
			validatedScopes = append(validatedScopes, scope)
		}
	}

	if len(validatedScopes) == 0 {
		return "", errors.New("no valid scopes provided")
	}

	return strings.Join(validatedScopes, " "), nil
}

func hasScope(scopes []string, scope string) bool {
	for _, s := range scopes {
		if s == scope {
			return true
		}
	}
	return false
}

func generateAuthorizationCode(clientId string, userId int, redirectUri string, scopes string, codeChallenge string, codeChallengeMethod string) (string, error) {
	code, err := common.GenerateRandomKey(32)
	if err != nil {
		return "", err
	}

	authCode := &model.OAuthAuthorizationCode{
		Code:                code,
		ClientId:            clientId,
		UserId:              userId,
		RedirectUri:         redirectUri,
		Scopes:              scopes,
		CodeChallenge:       codeChallenge,
		CodeChallengeMethod: codeChallengeMethod,
		Used:                false,
		ExpiresAt:           time.Now().Add(10 * time.Minute),
	}

	if err := model.CreateAuthorizationCode(authCode); err != nil {
		return "", err
	}

	return code, nil
}

func validatePKCE(codeVerifier string, codeChallenge string, method string) bool {
	if method == "" || method == "plain" {
		return codeVerifier == codeChallenge
	}

	if method == "S256" {
		hash := sha256.Sum256([]byte(codeVerifier))
		computed := base64.RawURLEncoding.EncodeToString(hash[:])
		return computed == codeChallenge
	}

	return false
}

