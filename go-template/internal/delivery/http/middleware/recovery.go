package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/your-org/go-template/pkg/logger"
)

func Recovery(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Error().
					Interface("panic", rec).
					Str("stack", string(debug.Stack())).
					Msg("recovered from panic")
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "INTERNAL_ERROR",
						"message": "internal server error",
					},
				})
			}
		}()
		c.Next()
	}
}
