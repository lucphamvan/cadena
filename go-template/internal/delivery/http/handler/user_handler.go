package handler

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/your-org/go-template/internal/delivery/http/middleware"
	"github.com/your-org/go-template/internal/domain/entity"
	"github.com/your-org/go-template/internal/usecase"
	"github.com/your-org/go-template/pkg/response"
)

type UserHandler struct {
	userUC        usecase.UserUseCase
	allowedSkills []string
	historyDays   int
}

func NewUserHandler(uc usecase.UserUseCase, allowedSkills []string, historyDays int) *UserHandler {
	return &UserHandler{
		userUC:        uc,
		allowedSkills: allowedSkills,
		historyDays:   historyDays,
	}
}

// GetProfile returns the current user's profile.
// GET /api/v1/profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)
	user, err := h.userUC.GetByID(c.Request.Context(), userID)
	if err != nil {
		handleError(c, err)
		return
	}
	response.OK(c, user)
}

// UpdateProfile updates the current user's profile (contact info + skills + photo)
// in a single multipart/form-data request.
// PUT /api/v1/profile
//
// Form fields:
//   - phone    (string, optional)
//   - email    (string, optional)
//   - address  (string, optional)
//   - skills   (JSON array string, optional) e.g. '["Go","React"]'
//   - photo    (file, optional)
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	// Parse form fields into UpdateProfileInput
	var input entity.UpdateProfileInput
	input.IPAddress = c.ClientIP()
	input.Device = c.GetHeader("User-Agent")

	if phone := c.PostForm("phone"); phone != "" {
		input.Phone = &phone
	}
	if email := c.PostForm("email"); email != "" {
		input.Email = &email
	}
	if address := c.PostForm("address"); address != "" {
		input.Address = &address
	}
	if skillsRaw := c.PostForm("skills"); skillsRaw != "" {
		var skills []string
		if err := json.Unmarshal([]byte(skillsRaw), &skills); err != nil {
			response.BadRequest(c, "invalid skills format, expected JSON array")
			return
		}
		input.Skills = skills
	}

	// Validate skills against allowed list if provided
	if input.Skills != nil {
		if err := usecase.ValidateSkills(input.Skills, h.allowedSkills); err != nil {
			response.BadRequest(c, err.Error())
			return
		}
	}

	// Handle optional photo upload
	var photoPath string
	file, err := c.FormFile("photo")
	if err == nil && file != nil {
		ext := filepath.Ext(file.Filename)
		filename := fmt.Sprintf("%s%s", uuid.New().String(), ext)
		savePath := filepath.Join("uploads", filename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			response.InternalError(c, "failed to save photo")
			return
		}
		photoPath = "/uploads/" + filename
	}

	user, err := h.userUC.UpdateProfile(c.Request.Context(), userID, input, photoPath)
	if err != nil {
		handleError(c, err)
		return
	}
	response.OK(c, user)
}

// GetChangeHistory returns the current user's profile change history.
// GET /api/v1/profile/history
func (h *UserHandler) GetChangeHistory(c *gin.Context) {
	userID := middleware.GetUserID(c)
	days := h.historyDays
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	history, err := h.userUC.GetChangeHistory(c.Request.Context(), userID, days)
	if err != nil {
		handleError(c, err)
		return
	}
	response.OK(c, history)
}

// GetSkillOptions returns the list of available skill options.
// GET /api/v1/skills
func (h *UserHandler) GetSkillOptions(c *gin.Context) {
	response.OK(c, h.allowedSkills)
}
