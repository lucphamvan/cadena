package router

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/your-org/go-template/internal/delivery/http/handler"
	"github.com/your-org/go-template/internal/delivery/http/middleware"
	"github.com/your-org/go-template/pkg/logger"
	"github.com/your-org/go-template/pkg/token"
)

type Config struct {
	Logger         *logger.Logger
	TokenMgr       *token.Manager
	AllowedOrigins []string
	Debug          bool

	HealthHandler *handler.HealthHandler
	UserHandler   *handler.UserHandler
	AuthHandler   *handler.AuthHandler
}

func New(cfg Config) http.Handler {
	if !cfg.Debug {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global middleware (outermost first)
	r.Use(middleware.Recovery(cfg.Logger))
	r.Use(middleware.Logging(cfg.Logger))
	r.Use(middleware.NewRateLimiter(100, time.Minute).Limit())
	r.Use(middleware.CORS(cfg.AllowedOrigins))
	r.Use(middleware.RequestID())

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	// Health routes
	health := r.Group("/health")
	{
		health.GET("/live", cfg.HealthHandler.Live)
	}

	// API v1
	v1 := r.Group("/api/v1")
	{
		// Public auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", cfg.AuthHandler.Register)
			auth.POST("/login", cfg.AuthHandler.Login)
			auth.POST("/refresh", cfg.AuthHandler.RefreshToken)

			// Protected auth routes
			authProtected := auth.Group("")
			authProtected.Use(middleware.Auth(cfg.TokenMgr))
			{
				authProtected.POST("/logout", cfg.AuthHandler.Logout)
			}
		}

		// Profile routes (user manages their own profile)
		profile := v1.Group("/profile")
		profile.Use(middleware.Auth(cfg.TokenMgr))
		{
			profile.GET("", cfg.UserHandler.GetProfile)
			profile.PUT("", cfg.UserHandler.UpdateProfile)
			profile.GET("/history", cfg.UserHandler.GetChangeHistory)
		}

		// Public skill options
		v1.GET("/skills", cfg.UserHandler.GetSkillOptions)
	}

	return r
}
