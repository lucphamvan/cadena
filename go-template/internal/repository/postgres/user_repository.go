package postgres

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/pkg/apperror"
	pgdb "github.com/your-org/go-template/pkg/database/postgres"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(client *pgdb.Client) *UserRepository {
	return &UserRepository{db: client.DB}
}

func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
	result := r.db.WithContext(ctx).Create(user)
	if result.Error != nil {
		if isUniqueViolation(result.Error) {
			return apperror.Wrap(apperror.ErrConflict, result.Error)
		}
		return apperror.Wrap(apperror.ErrInternalServer, result.Error)
	}
	return nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).Where("id = ?", id).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, apperror.Wrap(apperror.ErrNotFound, result.Error)
		}
		return nil, apperror.Wrap(apperror.ErrInternalServer, result.Error)
	}
	return &user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	result := r.db.WithContext(ctx).Where("email = ?", email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, apperror.Wrap(apperror.ErrNotFound, result.Error)
		}
		return nil, apperror.Wrap(apperror.ErrInternalServer, result.Error)
	}
	return &user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
	result := r.db.WithContext(ctx).Save(user)
	if result.Error != nil {
		return apperror.Wrap(apperror.ErrInternalServer, result.Error)
	}
	if result.RowsAffected == 0 {
		return apperror.ErrNotFound
	}
	return nil
}


// isUniqueViolation checks if the error is a unique constraint violation.
func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	s := err.Error()
	return containsStr(s, "23505") || containsStr(s, "duplicate key")
}

func containsStr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
