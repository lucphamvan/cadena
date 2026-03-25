package token

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// TokenType differentiates access tokens from refresh tokens.
// Using a dedicated claim prevents a refresh token from being accepted
// by the Auth middleware that expects an access token.
type TokenType string

const (
	TokenTypeAccess  TokenType = "access"
	TokenTypeRefresh TokenType = "refresh"
)

// Claims are the custom JWT claims used by this application.
type Claims struct {
	UserID    string    `json:"user_id"`
	Role      string    `json:"role"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

// Manager generates and validates JWT tokens.
type Manager struct {
	secret             string
	accessTokenExpiry  time.Duration
	refreshTokenExpiry time.Duration
}

// NewManager constructs a Manager.
func NewManager(secret string, accessExpiry, refreshExpiry time.Duration) *Manager {
	return &Manager{
		secret:             secret,
		accessTokenExpiry:  accessExpiry,
		refreshTokenExpiry: refreshExpiry,
	}
}

// GenerateTokenPair issues a new access + refresh token pair for the given user.
func (m *Manager) GenerateTokenPair(userID, role string) (access, refresh string, err error) {
	access, err = m.generate(userID, role, TokenTypeAccess, m.accessTokenExpiry)
	if err != nil {
		return "", "", err
	}
	refresh, err = m.generate(userID, role, TokenTypeRefresh, m.refreshTokenExpiry)
	if err != nil {
		return "", "", err
	}
	return access, refresh, nil
}

func (m *Manager) generate(userID, role string, tokenType TokenType, expiry time.Duration) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:    userID,
		Role:      role,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.New().String(),
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(expiry)),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(m.secret))
}

// Validate parses and validates a token string, returning its claims.
func (m *Manager) Validate(tokenStr string) (*Claims, error) {
	t, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(m.secret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := t.Claims.(*Claims)
	if !ok || !t.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// ValidateAccess validates the token and asserts it is an access token.
func (m *Manager) ValidateAccess(tokenStr string) (*Claims, error) {
	claims, err := m.Validate(tokenStr)
	if err != nil {
		return nil, err
	}
	if claims.TokenType != TokenTypeAccess {
		return nil, errors.New("not an access token")
	}
	return claims, nil
}

// ValidateRefresh validates the token and asserts it is a refresh token.
func (m *Manager) ValidateRefresh(tokenStr string) (*Claims, error) {
	claims, err := m.Validate(tokenStr)
	if err != nil {
		return nil, err
	}
	if claims.TokenType != TokenTypeRefresh {
		return nil, errors.New("not a refresh token")
	}
	return claims, nil
}

// HashToken returns a SHA-256 hex fingerprint of a token string.
// Used as Redis key when blacklisting refresh tokens.
func HashToken(tokenStr string) string {
	h := sha256.Sum256([]byte(tokenStr))
	return fmt.Sprintf("%x", h)
}
