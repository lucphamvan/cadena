package app

import (
	"context"
	"net/http"

	"github.com/your-org/go-template/internal/delivery/http/handler"
	"github.com/your-org/go-template/internal/delivery/http/router"
	"github.com/your-org/go-template/internal/domain/repository"
	pgrepo "github.com/your-org/go-template/internal/repository/postgres"
	"github.com/your-org/go-template/internal/usecase"
	"github.com/your-org/go-template/pkg/token"
)

func (app *App) wire(ctx context.Context) http.Handler {
	// ── Repositories ────────────────────────────────────────────────────────
	userRepo := pgrepo.NewUserRepository(app.pgClient)
	historyRepo := pgrepo.NewUserActivityRepository(app.pgClient)
	app.log.Info().Msg("using PostgreSQL repositories")

	// ── Optional infrastructure adapters ────────────────────────────────────
	var cache repository.CacheRepository
	if app.redisClient != nil {
		cache = app.redisClient
		app.log.Info().Msg("using Redis as cache backend")
	}

	// ── Token manager ────────────────────────────────────────────────────────
	tokenMgr := token.NewManager(
		app.cfg.JWT.Secret,
		app.cfg.JWT.AccessTokenExpiry,
		app.cfg.JWT.RefreshTokenExpiry,
	)

	// ── Use cases ────────────────────────────────────────────────────────────
	userUC := usecase.NewUserUseCase(userRepo, historyRepo, cache, app.log)
	authUC := usecase.NewAuthUseCase(userRepo, cache, tokenMgr, app.log)

	// ── Handlers ─────────────────────────────────────────────────────────────
	healthHandler := handler.NewHealthHandler()
	userHandler := handler.NewUserHandler(userUC, app.cfg.Employee.SkillOptions, app.cfg.Employee.ChangeHistoryDays)
	authHandler := handler.NewAuthHandler(authUC)

	// ── Router ────────────────────────────────────────────────────────────────
	return router.New(router.Config{
		Logger:         app.log,
		TokenMgr:       tokenMgr,
		AllowedOrigins: app.cfg.CORS.AllowedOrigins,
		Debug:          app.cfg.App.Env == "development",
		HealthHandler:  healthHandler,
		UserHandler:    userHandler,
		AuthHandler:    authHandler,
	})
}
