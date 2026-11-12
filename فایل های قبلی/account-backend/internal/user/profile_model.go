package user

import "time"

type UserProfile struct {
	UserID     string     `json:"user_id"`
	FirstName  string     `json:"first_name"`
	LastName   string     `json:"last_name"`
	NationalID string     `json:"national_id"`
	BirthDate  *time.Time `json:"birth_date,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
