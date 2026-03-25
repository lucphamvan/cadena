package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/internal/usecase"
	"github.com/your-org/go-template/pkg/apperror"
	"github.com/your-org/go-template/pkg/response"
	"github.com/your-org/go-template/pkg/validator"
)

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	authUC usecase.AuthUseCase
}

// NewAuthHandler constructs an AuthHandler.
func NewAuthHandler(uc usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUC: uc}
}

// Register godoc
// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var input entity.RegisterInput
	if !validator.BindAndValidate(c, &input) {
		return
	}

	tokens, err := h.authUC.Register(c.Request.Context(), input)
	if err != nil {
		handleError(c, err)
		return
	}

	response.Created(c, tokens)
}

// Login godoc
// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var input entity.LoginInput
	if !validator.BindAndValidate(c, &input) {
		return
	}

	tokens, err := h.authUC.Login(c.Request.Context(), input)
	if err != nil {
		handleError(c, err)
		return
	}

	response.OK(c, tokens)
}

// Logout godoc
// POST /api/v1/auth/logout  (requires Bearer token)
func (h *AuthHandler) Logout(c *gin.Context) {
	var input entity.RefreshInput
	if !validator.BindAndValidate(c, &input) {
		return
	}

	if err := h.authUC.Logout(c.Request.Context(), input.RefreshToken); err != nil {
		handleError(c, err)
		return
	}

	response.OK(c, gin.H{"message": "logged out successfully"})
}

// RefreshToken godoc
// POST /api/v1/auth/refresh
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var input entity.RefreshInput
	if !validator.BindAndValidate(c, &input) {
		return
	}

	tokens, err := h.authUC.RefreshToken(c.Request.Context(), input.RefreshToken)
	if err != nil {
		handleError(c, err)
		return
	}

	response.OK(c, tokens)
}

func handleError(c *gin.Context, err error) {
	if appErr, ok := err.(*apperror.AppError); ok {
		c.JSON(appErr.HTTPStatus, gin.H{
			"success": false,
			"error": gin.H{
				"code":    appErr.Code,
				"message": appErr.Message,
			},
		})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{
		"success": false,
		"error": gin.H{
			"code":    "INTERNAL_ERROR",
			"message": "internal server error",
		},
	})
}
