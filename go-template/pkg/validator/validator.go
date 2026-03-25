package validator

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

// BindAndValidate binds JSON body and validates struct tags using gin binding.
// Returns true on success; on failure it writes a 400 response and returns false.
func BindAndValidate(c *gin.Context, dst interface{}) bool {
	if err := c.ShouldBindJSON(dst); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "BAD_REQUEST",
				"message": err.Error(),
			},
		})
		return false
	}
	if err := validate.Struct(dst); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "VALIDATION_ERROR",
				"message": err.Error(),
			},
		})
		return false
	}
	return true
}
