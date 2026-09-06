package verification

import "time"

// VerificationType نوع احراز یا اعتبارسنجی را مشخص می‌کند.
type VerificationType string

const (
	VerificationTypeIdentity         VerificationType = "identity"
	VerificationTypeContact          VerificationType = "contact"
	VerificationTypeBank             VerificationType = "bank"
	VerificationTypeDocument         VerificationType = "document"
	VerificationTypeBiometric        VerificationType = "biometric"
	VerificationTypeLegalEntity      VerificationType = "legal_entity"
	VerificationTypeOfficialDocument VerificationType = "official_document"
)

// VerificationStatus وضعیت عملیات احراز را مشخص می‌کند.
type VerificationStatus string

const (
	VerificationStatusPending      VerificationStatus = "pending"
	VerificationStatusVerified     VerificationStatus = "verified"
	VerificationStatusRejected     VerificationStatus = "rejected"
	VerificationStatusFailed       VerificationStatus = "failed"
	VerificationStatusExpired      VerificationStatus = "expired"
	VerificationStatusManualReview VerificationStatus = "manual_review"
)

// VerificationLevel سطح احراز را مشخص می‌کند.
type VerificationLevel string

const (
	VerificationLevelBasic    VerificationLevel = "basic"
	VerificationLevelStandard VerificationLevel = "standard"
	VerificationLevelStrong   VerificationLevel = "strong"
)

// Verification نتیجه یک عملیات احراز یا اعتبارسنجی است.
type Verification struct {
	ID                string             `json:"id"`
	UserID            string             `json:"user_id"`
	VerificationType  VerificationType   `json:"verification_type"`
	Provider          string             `json:"provider"`
	Status            VerificationStatus `json:"status"`
	ReferenceID       string             `json:"reference_id,omitempty"`
	VerificationLevel VerificationLevel  `json:"verification_level"`
	VerifiedAt        *time.Time         `json:"verified_at,omitempty"`
	ExpiresAt         *time.Time         `json:"expires_at,omitempty"`
	RejectionReason   string             `json:"rejection_reason,omitempty"`
	CreatedAt         time.Time          `json:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at"`
}

// IsValid بررسی می‌کند که نتیجه احراز هنوز معتبر است یا خیر.
func (v *Verification) IsValid(now time.Time) bool {
	if v.Status != VerificationStatusVerified {
		return false
	}

	if v.ExpiresAt == nil {
		return true
	}

	return now.Before(*v.ExpiresAt)
}
