package user

import "time"

type LegalEntity struct {
	UserID             string     `json:"user_id"`
	LegalName          string     `json:"legal_name"`
	NationalID         string     `json:"national_id"`
	RegistrationNumber *string    `json:"registration_number,omitempty"`
	EconomicCode       *string    `json:"economic_code,omitempty"`
	LegalType          *string    `json:"legal_type,omitempty"`
	RegistrationDate   *time.Time `json:"registration_date,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
}
