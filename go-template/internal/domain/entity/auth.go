package entity

// TokenPair holds an access token and a refresh token.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// RegisterInput is used for email/password registration.
type RegisterInput struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required,min=1,max=100"`
	LastName  string `json:"last_name" validate:"required,min=1,max=100"`
}

// LoginInput is used for email/password login.
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RefreshInput carries a refresh token for renewal.
type RefreshInput struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}
