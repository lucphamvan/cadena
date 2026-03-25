package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/internal/domain/repository"
	"github.com/your-org/go-template/pkg/apperror"
	"github.com/your-org/go-template/pkg/logger"
)

type UserUseCase interface {
	GetByID(ctx context.Context, id string) (*entity.User, error)
	UpdateProfile(ctx context.Context, id string, input entity.UpdateProfileInput, photoPath string) (*entity.User, error)
	GetChangeHistory(ctx context.Context, userID string, days int) ([]*entity.UserActivity, error)
}

type userUseCase struct {
	userRepo    repository.UserRepository
	historyRepo repository.UserActivityRepository
	cache       repository.CacheRepository
	log         *logger.Logger
}

func NewUserUseCase(
	userRepo repository.UserRepository,
	historyRepo repository.UserActivityRepository,
	cache repository.CacheRepository,
	log *logger.Logger,
) UserUseCase {
	return &userUseCase{
		userRepo:    userRepo,
		historyRepo: historyRepo,
		cache:       cache,
		log:         log.WithComponent("user-usecase"),
	}
}

func (uc *userUseCase) GetByID(ctx context.Context, id string) (*entity.User, error) {
	if uc.cache != nil {
		var cached entity.User
		if err := uc.cache.Get(ctx, "user:"+id, &cached); err == nil {
			return &cached, nil
		}
	}

	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrNotFound, err)
	}

	if uc.cache != nil {
		_ = uc.cache.Set(ctx, "user:"+id, user, 300)
	}

	return user, nil
}

// UpdateProfile updates contact info, skills, and profile photo in a single call.
// photoPath is optional — pass "" if no new photo was uploaded.
func (uc *userUseCase) UpdateProfile(ctx context.Context, id string, input entity.UpdateProfileInput, photoPath string) (*entity.User, error) {
	user, err := uc.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrNotFound, err)
	}

	var changes []entity.ProfileChangeHistory

	// Track and apply contact info changes
	if input.Phone != nil && *input.Phone != user.Phone {
		changes = append(changes, entity.ProfileChangeHistory{ID: uuid.New().String(), Field: "phone", OldValue: user.Phone, NewValue: *input.Phone})
		user.Phone = *input.Phone
	}
	if input.Email != nil && *input.Email != user.Email {
		changes = append(changes, entity.ProfileChangeHistory{ID: uuid.New().String(), Field: "email", OldValue: user.Email, NewValue: *input.Email})
		user.Email = *input.Email
	}
	if input.Address != nil && *input.Address != user.Address {
		changes = append(changes, entity.ProfileChangeHistory{ID: uuid.New().String(), Field: "address", OldValue: user.Address, NewValue: *input.Address})
		user.Address = *input.Address
	}

	// Track and apply skills changes
	if input.Skills != nil {
		oldSkills := skillsToString(user.Skills)
		newSkills := skillsToString(input.Skills)
		if oldSkills != newSkills {
			changes = append(changes, entity.ProfileChangeHistory{ID: uuid.New().String(), Field: "skills", OldValue: oldSkills, NewValue: newSkills})
		}
		user.Skills = input.Skills
	}

	// Track and apply photo change
	if photoPath != "" && photoPath != user.ProfilePhoto {
		changes = append(changes, entity.ProfileChangeHistory{ID: uuid.New().String(), Field: "profile_photo", OldValue: user.ProfilePhoto, NewValue: photoPath})
		user.ProfilePhoto = photoPath
	}

	user.UpdatedAt = time.Now().UTC()

	// Update the user
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, apperror.Wrap(apperror.ErrInternalServer, err)
	}

	// Save the grouped activity if there are any changes
	if len(changes) > 0 {
		activity := &entity.UserActivity{
			ID:        uuid.New().String(),
			UserID:    user.ID,
			Action:    "updated profile",
			Device:    input.Device,
			IPAddress: input.IPAddress,
			Changes:   changes,
		}
		if err := uc.historyRepo.CreateActivity(ctx, activity); err != nil {
			uc.log.Error().Err(err).Str("user_id", user.ID).Msg("failed to record profile change activity")
		}
	}

	if uc.cache != nil {
		_ = uc.cache.Delete(ctx, "user:"+id)
	}

	return user, nil
}

// GetChangeHistory returns profile change history for a user within the given number of days.
func (uc *userUseCase) GetChangeHistory(ctx context.Context, userID string, days int) ([]*entity.UserActivity, error) {
	if days <= 0 {
		days = 7
	}
	since := time.Now().UTC().AddDate(0, 0, -days)
	return uc.historyRepo.GetActivitiesByUserID(ctx, userID, since)
}

func skillsToString(skills []string) string {
	if len(skills) == 0 {
		return "[]"
	}
	b, _ := json.Marshal(skills)
	return string(b)
}

// ValidateSkills checks that all provided skills are in the allowed list.
func ValidateSkills(skills []string, allowedSkills []string) error {
	allowed := make(map[string]bool, len(allowedSkills))
	for _, s := range allowedSkills {
		allowed[strings.ToLower(s)] = true
	}
	var invalid []string
	for _, s := range skills {
		if !allowed[strings.ToLower(s)] {
			invalid = append(invalid, s)
		}
	}
	if len(invalid) > 0 {
		return fmt.Errorf("invalid skills: %s", strings.Join(invalid, ", "))
	}
	return nil
}
