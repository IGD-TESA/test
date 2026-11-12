package user

import "time"

type User struct {
	ID        string    `json:"id"`
	UserType  string    `json:"user_type"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
