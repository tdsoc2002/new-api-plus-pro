package middleware

import (
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// OAuthTokenAuth validates OAuth access_token from Authorization header
func OAuthTokenAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":             "invalid_request",
				"error_description": "Missing Authorization header",
			})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":             "invalid_request",
				"error_description": "Authorization header must use Bearer scheme",
			})
			c.Abort()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":             "invalid_token",
				"error_description": "Access token is empty",
			})
			c.Abort()
			return
		}

		// Validate access token
		accessToken, err := model.ValidateOAuthAccessToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":             "invalid_token",
				"error_description": "The access token is invalid or expired",
			})
			c.Abort()
			return
		}

		// Set context values for downstream handlers
		c.Set("oauth_user_id", accessToken.UserId)
		c.Set("oauth_client_id", accessToken.ClientId)
		c.Set("oauth_scopes", accessToken.Scopes)
		c.Set("oauth_token_id", accessToken.Id)

		c.Next()
	}
}
