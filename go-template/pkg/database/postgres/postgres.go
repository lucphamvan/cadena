package postgres

import (
	"context"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	"github.com/your-org/go-template/config"
	"github.com/your-org/go-template/pkg/logger"
)

type Client struct {
	DB  *gorm.DB
	log *logger.Logger
}

func New(ctx context.Context, cfg config.PostgresConfig, log *logger.Logger) (*Client, error) {
	l := log.WithComponent("postgres")

	gormCfg := &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Silent),
	}

	db, err := gorm.Open(postgres.Open(cfg.DSN()), gormCfg)
	if err != nil {
		return nil, fmt.Errorf("postgres: connect: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("postgres: get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("postgres: ping: %w", err)
	}

	l.Info().Msg("connected to PostgreSQL (GORM)")
	return &Client{DB: db, log: l}, nil
}

func (c *Client) Close() {
	sqlDB, err := c.DB.DB()
	if err != nil {
		c.log.Error().Err(err).Msg("failed to get underlying sql.DB for close")
		return
	}
	_ = sqlDB.Close()
	c.log.Info().Msg("PostgreSQL connection closed")
}

func (c *Client) HealthCheck(ctx context.Context) error {
	sqlDB, err := c.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

// AutoMigrate runs GORM auto-migration for the given models.
func (c *Client) AutoMigrate(models ...interface{}) error {
	return c.DB.AutoMigrate(models...)
}
