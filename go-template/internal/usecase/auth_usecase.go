package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/internal/domain/repository"
	"github.com/your-org/go-template/pkg/apperror"
	"github.com/your-org/go-template/pkg/logger"
	"github.com/your-org/go-template/pkg/token"
)

// AuthUseCase defines auth operations.
type AuthUseCase interface {
	Register(ctx context.Context, input entity.RegisterInput) (*entity.TokenPair, error)
	Login(ctx context.Context, input entity.LoginInput) (*entity.TokenPair, error)
	Logout(ctx context.Context, refreshToken string) error
	RefreshToken(ctx context.Context, refreshToken string) (*entity.TokenPair, error)
}

type authUseCase struct {
	userRepo repository.UserRepository
	cache    repository.CacheRepository
	tokenMgr *token.Manager
	log      *logger.Logger
}

// NewAuthUseCase creates an AuthUseCase.
func NewAuthUseCase(
	userRepo repository.UserRepository,
	cache repository.CacheRepository,
	tokenMgr *token.Manager,
	log *logger.Logger,
) AuthUseCase {
	return &authUseCase{
		userRepo: userRepo,
		cache:    cache,
		tokenMgr: tokenMgr,
		log:      log.WithComponent("auth-usecase"),
	}
}

// Register creates a new account with email/password.
func (uc *authUseCase) Register(ctx context.Context, input entity.RegisterInput) (*entity.TokenPair, error) {
	existing, _ := uc.userRepo.GetByEmail(ctx, input.Email)
	if existing != nil {
		return nil, apperror.Wrap(apperror.ErrConflict, fmt.Errorf("email %s already registered", input.Email))
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrInternalServer, err)
	}

	now := time.Now().UTC()
	user := &entity.User{
		ID:        uuid.New().String(),
		Email:     input.Email,
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Password:  string(hashed),
		Role:      "user",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, apperror.Wrap(apperror.ErrInternalServer, err)
	}

	uc.log.Info().Str("user_id", user.ID).Msg("user registered")
	return uc.issueTokens(user)
}

// Login validates credentials and returns a token pair.
func (uc *authUseCase) Login(ctx context.Context, input entity.LoginInput) (*entity.TokenPair, error) {
	user, err := uc.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrUnauthorized, fmt.Errorf("invalid credentials"))
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, apperror.Wrap(apperror.ErrUnauthorized, fmt.Errorf("invalid credentials"))
	}

	uc.log.Info().Str("user_id", user.ID).Msg("user logged in")
	return uc.issueTokens(user)
}

// Logout blacklists a refresh token (requires Redis; otherwise is a no-op).
func (uc *authUseCase) Logout(ctx context.Context, refreshToken string) error {
	if uc.cache == nil {
		return nil // stateless — client must discard token
	}

	claims, err := uc.tokenMgr.ValidateRefresh(refreshToken)
	if err != nil {
		return apperror.Wrap(apperror.ErrUnauthorized, fmt.Errorf("invalid refresh token"))
	}

	ttl := time.Until(claims.ExpiresAt.Time)
	if ttl <= 0 {
		return nil // already expired
	}

	key := "auth:blacklist:" + token.HashToken(refreshToken)
	if err := uc.cache.Set(ctx, key, "1", int(ttl.Seconds())); err != nil {
		uc.log.Error().Err(err).Msg("failed to blacklist refresh token")
	}
	return nil
}

// RefreshToken issues a new access token from a valid refresh token.
func (uc *authUseCase) RefreshToken(ctx context.Context, refreshToken string) (*entity.TokenPair, error) {
	claims, err := uc.tokenMgr.ValidateRefresh(refreshToken)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrUnauthorized, fmt.Errorf("invalid or expired refresh token"))
	}

	// Check Redis blacklist if available.
	if uc.cache != nil {
		key := "auth:blacklist:" + token.HashToken(refreshToken)
		var v string
		if uc.cache.Get(ctx, key, &v) == nil {
			return nil, apperror.Wrap(apperror.ErrUnauthorized, fmt.Errorf("refresh token has been revoked"))
		}
	}

	user, err := uc.userRepo.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrUnauthorized, fmt.Errorf("user not found"))
	}

	return uc.issueTokens(user)
}

// issueTokens generates an access + refresh token pair for a user.
func (uc *authUseCase) issueTokens(user *entity.User) (*entity.TokenPair, error) {
	access, refresh, err := uc.tokenMgr.GenerateTokenPair(user.ID, user.Role)
	if err != nil {
		return nil, apperror.Wrap(apperror.ErrInternalServer, err)
	}
	return &entity.TokenPair{
		AccessToken:  access,
		RefreshToken: refresh,
	}, nil
}
