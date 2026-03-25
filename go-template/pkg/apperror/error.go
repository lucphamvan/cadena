package apperror

import (
	"errors"
	"fmt"
	"net/http"
)

type AppError struct {
	Code       string
	Message    string
	HTTPStatus int
	Err        error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

var (
	ErrNotFound       = &AppError{Code: "NOT_FOUND", Message: "resource not found", HTTPStatus: http.StatusNotFound}
	ErrUnauthorized   = &AppError{Code: "UNAUTHORIZED", Message: "unauthorized", HTTPStatus: http.StatusUnauthorized}
	ErrForbidden      = &AppError{Code: "FORBIDDEN", Message: "forbidden", HTTPStatus: http.StatusForbidden}
	ErrBadRequest     = &AppError{Code: "BAD_REQUEST", Message: "bad request", HTTPStatus: http.StatusBadRequest}
	ErrInternalServer = &AppError{Code: "INTERNAL_ERROR", Message: "internal server error", HTTPStatus: http.StatusInternalServerError}
	ErrConflict       = &AppError{Code: "CONFLICT", Message: "resource already exists", HTTPStatus: http.StatusConflict}
)

func New(code, message string, status int) *AppError {
	return &AppError{Code: code, Message: message, HTTPStatus: status}
}

func Wrap(appErr *AppError, err error) *AppError {
	return &AppError{
		Code:       appErr.Code,
		Message:    appErr.Message,
		HTTPStatus: appErr.HTTPStatus,
		Err:        err,
	}
}

func Is(err error, target *AppError) bool {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr.Code == target.Code
	}
	return false
}
