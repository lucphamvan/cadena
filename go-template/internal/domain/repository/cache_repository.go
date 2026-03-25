package repository

import "context"

type CacheRepository interface {
	Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error
	Get(ctx context.Context, key string, dest interface{}) error
	Delete(ctx context.Context, key string) error
	Exists(ctx context.Context, key string) (bool, error)
}
