package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/your-org/go-template/pkg/token"
)

const UserIDKey = "user_id"
const UserRoleKey = "user_role"

// Auth validates a Bearer JWT and stores user claims in the gin context.
func Auth(tokenMgr *token.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "missing authorization header",
				},
			})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "invalid authorization header format",
				},
			})
			return
		}

		// Validate as access token only — refresh tokens must not be accepted here.
		claims, err := tokenMgr.ValidateAccess(parts[1])
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "invalid or expired access token",
				},
			})
			return
		}

		c.Set(UserIDKey, claims.UserID)
		c.Set(UserRoleKey, claims.Role)
		c.Next()
	}
}

// GetUserID retrieves the authenticated user ID from the gin context.
func GetUserID(c *gin.Context) string {
	return c.GetString(UserIDKey)
}

// GetUserRole retrieves the authenticated user role from the gin context.
func GetUserRole(c *gin.Context) string {
	return c.GetString(UserRoleKey)
}
