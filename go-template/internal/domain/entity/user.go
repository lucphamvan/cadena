package entity

import "time"

type User struct {
	ID           string   `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Email        string   `json:"email" validate:"required,email" gorm:"type:varchar(255);uniqueIndex;not null"`
	FirstName    string   `json:"first_name" validate:"required,min=1,max=100" gorm:"type:varchar(100);not null"`
	LastName     string   `json:"last_name" validate:"required,min=1,max=100" gorm:"type:varchar(100);not null"`
	Password     string   `json:"-" gorm:"type:text;not null;default:''"`
	Phone        string   `json:"phone" gorm:"type:varchar(20)"`
	Address      string   `json:"address" gorm:"type:text"`
	ProfilePhoto string   `json:"profile_photo" gorm:"type:text"`
	Skills       []string `json:"skills" gorm:"serializer:json;type:text"`
	Role         string   `json:"role" gorm:"type:varchar(50);not null;default:'user'"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (User) TableName() string {
	return "users"
}

// UpdateProfileInput is used to update all editable profile fields at once.
// FirstName and LastName are NOT included (read-only).
type UpdateProfileInput struct {
	Phone     *string  `json:"phone,omitempty" validate:"omitempty,max=20"`
	Email     *string  `json:"email,omitempty" validate:"omitempty,email"`
	Address   *string  `json:"address,omitempty"`
	Skills    []string `json:"skills,omitempty"`
	Device    string   `json:"-"` // Added from handler config
	IPAddress string   `json:"-"` // Added from handler config
}
