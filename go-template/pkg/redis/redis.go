package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"

	"github.com/your-org/go-template/config"
	"github.com/your-org/go-template/pkg/logger"
)

type Client struct {
	rdb *goredis.Client
	log *logger.Logger
}

func New(ctx context.Context, cfg config.RedisConfig, log *logger.Logger) (*Client, error) {
	l := log.WithComponent("redis")

	rdb := goredis.NewClient(&goredis.Options{
		Addr:         cfg.Address(),
		Password:     cfg.Password,
		DB:           cfg.DB,
		PoolSize:     cfg.PoolSize,
		MinIdleConns: cfg.MinIdleConns,
		DialTimeout:  cfg.DialTimeout,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	})

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis: ping: %w", err)
	}

	l.Info().Msg("connected to Redis")
	return &Client{rdb: rdb, log: l}, nil
}

func (c *Client) Close() error {
	c.log.Info().Msg("Redis connection closed")
	return c.rdb.Close()
}

func (c *Client) HealthCheck(ctx context.Context) error {
	return c.rdb.Ping(ctx).Err()
}

// Set serialises value to JSON and stores it with the given TTL in seconds.
func (c *Client) Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error {
	b, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("cache set marshal: %w", err)
	}
	if err := c.rdb.Set(ctx, key, b, time.Duration(ttlSeconds)*time.Second).Err(); err != nil {
		return fmt.Errorf("cache set: %w", err)
	}
	return nil
}

// Get retrieves and deserialises the value stored at key into dest.
func (c *Client) Get(ctx context.Context, key string, dest interface{}) error {
	b, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		if err == goredis.Nil {
			return fmt.Errorf("cache miss: key=%s", key)
		}
		return fmt.Errorf("cache get: %w", err)
	}
	if err := json.Unmarshal(b, dest); err != nil {
		return fmt.Errorf("cache get unmarshal: %w", err)
	}
	return nil
}

// Delete removes a key from the cache.
func (c *Client) Delete(ctx context.Context, key string) error {
	if err := c.rdb.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("cache delete: %w", err)
	}
	return nil
}

// Exists reports whether the key is present in the cache.
func (c *Client) Exists(ctx context.Context, key string) (bool, error) {
	n, err := c.rdb.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("cache exists: %w", err)
	}
	return n > 0, nil
}
