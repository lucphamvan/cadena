package entity

import "time"

// UserActivity tracks a high-level user action (e.g., "updated profile").
// It groups multiple field-level changes (ProfileChangeHistory) into a single transaction.
type UserActivity struct {
	ID        string                 `json:"id" gorm:"primaryKey;type:varchar(36)"`
	UserID    string                 `json:"user_id" gorm:"type:varchar(36);index;not null"`
	Action    string                 `json:"action" gorm:"type:varchar(100);not null"`
	Device    string                 `json:"device" gorm:"type:varchar(255)"`
	IPAddress string                 `json:"ip_address" gorm:"type:varchar(50)"`
	CreatedAt time.Time              `json:"created_at" gorm:"autoCreateTime"`
	Changes   []ProfileChangeHistory `json:"changes" gorm:"foreignKey:ActivityID;constraint:OnDelete:CASCADE"`
}

func (UserActivity) TableName() string {
	return "user_activities"
}
