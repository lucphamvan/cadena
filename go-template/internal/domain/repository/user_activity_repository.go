package repository

import (
	"context"
	"time"

	"github.com/your-org/go-template/internal/domain/entity"
)

type UserActivityRepository interface {
	CreateActivity(ctx context.Context, activity *entity.UserActivity) error
	GetActivitiesByUserID(ctx context.Context, userID string, since time.Time) ([]*entity.UserActivity, error)
}
