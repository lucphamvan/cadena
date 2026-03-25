package app

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/your-org/go-template/config"
	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/pkg/database/postgres"
	"github.com/your-org/go-template/pkg/logger"
	redispkg "github.com/your-org/go-template/pkg/redis"
)

type App struct {
	cfg *config.Config
	log *logger.Logger

	pgClient    *postgres.Client
	redisClient *redispkg.Client

	httpServer *http.Server
}

func New(cfg *config.Config) *App {
	log := logger.New(cfg.Logger)
	return &App{
		cfg: cfg,
		log: log,
	}
}

func (app *App) Run() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if err := app.cfg.Validate(); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	if err := app.initInfrastructure(ctx); err != nil {
		return fmt.Errorf("init infrastructure: %w", err)
	}

	// Ensure uploads directory exists
	if err := os.MkdirAll("uploads", 0755); err != nil {
		return fmt.Errorf("create uploads dir: %w", err)
	}

	h := app.wire(ctx)

	app.httpServer = &http.Server{
		Addr:         app.cfg.Server.HTTP.Address(),
		Handler:      h,
		ReadTimeout:  app.cfg.Server.HTTP.ReadTimeout,
		WriteTimeout: app.cfg.Server.HTTP.WriteTimeout,
		IdleTimeout:  app.cfg.Server.HTTP.IdleTimeout,
	}

	errCh := make(chan error, 1)
	go func() {
		app.log.Info().
			Str("addr", app.cfg.Server.HTTP.Address()).
			Str("env", app.cfg.App.Env).
			Msg("starting HTTP server")
		if err := app.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case <-quit:
		app.log.Info().Msg("received shutdown signal")
	case err := <-errCh:
		return fmt.Errorf("http server: %w", err)
	}

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), app.cfg.Server.HTTP.ShutdownTimeout)
	defer shutdownCancel()

	if err := app.httpServer.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("http server shutdown: %w", err)
	}

	app.cleanup()
	app.log.Info().Msg("server stopped gracefully")

	return nil
}

func (app *App) initInfrastructure(ctx context.Context) error {
	var err error

	if app.cfg.Features.Postgres.Enabled {
		app.pgClient, err = postgres.New(ctx, app.cfg.Postgres, app.log)
		if err != nil {
			return fmt.Errorf("postgres: %w", err)
		}

		// Run GORM auto-migration for all entities
		if err := app.pgClient.AutoMigrate(
			&entity.User{},
			&entity.UserActivity{},
			&entity.ProfileChangeHistory{},
		); err != nil {
			return fmt.Errorf("postgres auto-migrate: %w", err)
		}

		app.log.Info().Msg("database auto-migration completed")
	}

	if app.cfg.Features.Redis.Enabled {
		app.redisClient, err = redispkg.New(ctx, app.cfg.Redis, app.log)
		if err != nil {
			return fmt.Errorf("redis: %w", err)
		}
	}

	return nil
}

func (app *App) cleanup() {
	if app.pgClient != nil {
		app.pgClient.Close()
	}
	if app.redisClient != nil {
		_ = app.redisClient.Close()
	}
}
