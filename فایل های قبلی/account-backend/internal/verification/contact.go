package verification

import (
	"context"
	"errors"
	"strings"
)

// ContactType نوع اطلاعات تماس را مشخص می‌کند.
type ContactType string

const (
	ContactTypeMobile ContactType = "mobile"
	ContactTypeEmail  ContactType = "email"
)

// ContactData اطلاعات تماس مورد استفاده برای احراز را نگهداری می‌کند.
type ContactData struct {
	Type  ContactType
	Value string
	OTP   string
}

// ContactVerifier منطق احراز اطلاعات تماس را مدیریت می‌کند.
type ContactVerifier struct {
	providers *ProviderManager
}

// NewContactVerifier یک ContactVerifier جدید ایجاد می‌کند.
func NewContactVerifier(providers *ProviderManager) *ContactVerifier {
	return &ContactVerifier{
		providers: providers,
	}
}

// VerifyContact احراز اطلاعات تماس را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *ContactVerifier) VerifyContact(
	ctx context.Context,
	userID string,
	providerName string,
	data *ContactData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("contact data is nil")
	}

	if err := validateContactData(data); err != nil {
		return nil, err
	}

	if v == nil || v.providers == nil {
		return nil, errors.New("provider manager is nil")
	}

	provider, err := v.providers.Get(providerName)
	if err != nil {
		return nil, err
	}

	request := &ProviderRequest{
		UserID:           userID,
		VerificationType: VerificationTypeContact,
		Data: map[string]string{
			"contact_type":  string(data.Type),
			"contact_value": data.Value,
		},
	}

	// OTP نباید در ProviderRequest ذخیره یا ارسال شود.
	// اعتبارسنجی OTP باید در لایه موقت/امن OTP انجام شود.
	return provider.Verify(ctx, request)
}

// validateContactData اطلاعات تماس را قبل از ارسال به Provider بررسی می‌کند.
func validateContactData(data *ContactData) error {
	if data.Type != ContactTypeMobile && data.Type != ContactTypeEmail {
		return errors.New("invalid contact type")
	}

	if strings.TrimSpace(data.Value) == "" {
		return errors.New("contact value is empty")
	}

	return nil
}
