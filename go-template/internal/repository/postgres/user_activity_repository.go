package postgres

import (
	"context"
	"time"

	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/pkg/apperror"
	pgdb "github.com/your-org/go-template/pkg/database/postgres"
	"gorm.io/gorm"
)

type UserActivityRepository struct {
	db *gorm.DB
}

func NewUserActivityRepository(client *pgdb.Client) *UserActivityRepository {
	return &UserActivityRepository{db: client.DB}
}

func (r *UserActivityRepository) CreateActivity(ctx context.Context, activity *entity.UserActivity) error {
	result := r.db.WithContext(ctx).Create(activity)
	if result.Error != nil {
		return apperror.Wrap(apperror.ErrInternalServer, result.Error)
	}
	return nil
}

func (r *UserActivityRepository) GetActivitiesByUserID(ctx context.Context, userID string, since time.Time) ([]*entity.UserActivity, error) {
	var activities []*entity.UserActivity
	result := r.db.WithContext(ctx).
		Preload("Changes"). // Load associated ProfileChangeHistory
		Where("user_id = ? AND created_at >= ?", userID, since).
		Order("created_at DESC").
		Find(&activities)
	if result.Error != nil {
		return nil, apperror.Wrap(apperror.ErrInternalServer, result.Error)
	}
	return activities, nil
}
