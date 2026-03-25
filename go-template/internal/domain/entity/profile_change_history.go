package entity

// ProfileChangeHistory tracks individual field changes made during a UserActivity.
type ProfileChangeHistory struct {
	ID         string `json:"-" gorm:"primaryKey;type:varchar(36)"`
	ActivityID string `json:"activity_id" gorm:"type:varchar(36);index;not null"`
	Field      string `json:"field" gorm:"type:varchar(100);not null"`
	OldValue   string `json:"old_value" gorm:"type:text"`
	NewValue   string `json:"new_value" gorm:"type:text"`
}

func (ProfileChangeHistory) TableName() string {
	return "profile_change_histories"
}
