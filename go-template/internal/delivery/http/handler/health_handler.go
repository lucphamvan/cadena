package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/your-org/go-template/pkg/response"
)

type HealthHandler struct {
}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Live(c *gin.Context) {
	response.OK(c, gin.H{"status": "alive"})
}
