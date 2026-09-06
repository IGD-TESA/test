package verification

import "context"

// ProviderRequest اطلاعات موردنیاز برای ارسال درخواست احراز به Provider است.
type ProviderRequest struct {
	UserID           string
	VerificationType VerificationType
	ReferenceID      string
	Data             map[string]string
}

// ProviderResult نتیجه‌ای است که Provider احراز برمی‌گرداند.
type ProviderResult struct {
	Status            VerificationStatus
	ReferenceID       string
	VerificationLevel VerificationLevel
	RejectionReason   string
}

// Provider قرارداد استاندارد تمام سرویس‌دهندگان احراز است.
type Provider interface {
	Name() string

	Verify(
		ctx context.Context,
		request *ProviderRequest,
	) (*ProviderResult, error)
}
