package auth

import "time"

type RegistrationRequest struct {
	UserType    string `json:"user_type"`
	NationalID  string `json:"national_id"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	FatherName  string `json:"father_name"`
	BirthDate   string `json:"birth_date"`
	PhoneNumber string `json:"phone_number"`
	Email       string `json:"email,omitempty"`
	Address     string `json:"address"`
	PostalCode  string `json:"postal_code"`
	Password    string `json:"password"`
}

type RegistrationResponse struct {
	UserID        string    `json:"user_id"`
	UserType      string    `json:"user_type"`
	Status        string    `json:"status"`
	PhoneVerified bool      `json:"phone_verified"`
	CreatedAt     time.Time `json:"created_at"`
}
