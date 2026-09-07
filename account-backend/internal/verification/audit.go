package verification

import "time"

type VerificationAudit struct {
	ID               string
	UserID           string
	VerificationID   string
	Operation        string
	VerificationType string
	Provider         string
	Status           string
	IdempotencyKey   string
	IPAddress        string
	UserAgent        string
	ErrorMessage     string
	Metadata         []byte
	CreatedAt        time.Time
}
