package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/your-org/go-template/pkg/logger"
)

func Logging(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Info().
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", c.Writer.Status()).
			Dur("latency", time.Since(start)).
			Str("remote_addr", c.ClientIP()).
			Str("request_id", c.GetString(string(RequestIDKey))).
			Msg("request")
	}
}
