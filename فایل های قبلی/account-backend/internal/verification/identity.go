package verification

import (
	"context"
	"errors"
	"strings"
	"time"
)

// IdentityData اطلاعات پایه هویتی کاربر برای احراز است.
type IdentityData struct {
	NationalID  string
	FirstName   string
	LastName    string
	DateOfBirth time.Time
}

// IdentityVerifier منطق آماده‌سازی و اجرای احراز هویت را مدیریت می‌کند.
type IdentityVerifier struct {
	providers *ProviderManager
}

// NewIdentityVerifier یک IdentityVerifier جدید ایجاد می‌کند.
func NewIdentityVerifier(providers *ProviderManager) *IdentityVerifier {
	return &IdentityVerifier{
		providers: providers,
	}
}

// VerifyIdentity احراز هویت کاربر را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *IdentityVerifier) VerifyIdentity(
	ctx context.Context,
	userID string,
	providerName string,
	data *IdentityData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("identity data is nil")
	}

	if err := validateIdentityData(data); err != nil {
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
		VerificationType: VerificationTypeIdentity,
		Data: map[string]string{
			"national_id":   data.NationalID,
			"first_name":    data.FirstName,
			"last_name":     data.LastName,
			"date_of_birth": data.DateOfBirth.Format("2006-01-02"),
		},
	}

	return provider.Verify(ctx, request)
}

// validateIdentityData اطلاعات هویتی را قبل از ارسال به Provider بررسی می‌کند.
func validateIdentityData(data *IdentityData) error {
	if strings.TrimSpace(data.NationalID) == "" {
		return errors.New("national id is empty")
	}

	if strings.TrimSpace(data.FirstName) == "" {
		return errors.New("first name is empty")
	}

	if strings.TrimSpace(data.LastName) == "" {
		return errors.New("last name is empty")
	}

	if data.DateOfBirth.IsZero() {
		return errors.New("date of birth is empty")
	}

	return nil
}
