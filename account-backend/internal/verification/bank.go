package verification

import (
	"context"
	"errors"
	"strings"
)

// BankData اطلاعات حساب بانکی مورد استفاده برای احراز را نگهداری می‌کند.
type BankData struct {
	IBAN string
}

// BankVerifier منطق احراز حساب بانکی را مدیریت می‌کند.
type BankVerifier struct {
	providers *ProviderManager
}

// NewBankVerifier یک BankVerifier جدید ایجاد می‌کند.
func NewBankVerifier(providers *ProviderManager) *BankVerifier {
	return &BankVerifier{
		providers: providers,
	}
}

// VerifyBank احراز حساب بانکی را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *BankVerifier) VerifyBank(
	ctx context.Context,
	userID string,
	providerName string,
	data *BankData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("bank data is nil")
	}

	if err := validateBankData(data); err != nil {
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
		VerificationType: VerificationTypeBank,
		Data: map[string]string{
			"iban": data.IBAN,
		},
	}

	return provider.Verify(ctx, request)
}

// validateBankData اطلاعات بانکی را قبل از ارسال به Provider بررسی می‌کند.
func validateBankData(data *BankData) error {
	iban := strings.TrimSpace(data.IBAN)

	if iban == "" {
		return errors.New("iban is empty")
	}

	// ساختار دقیق IBAN و تطبیق مالکیت
	// در Provider بانکی انجام خواهد شد.
	if !strings.HasPrefix(strings.ToUpper(iban), "IR") {
		return errors.New("invalid iban")
	}

	if len(iban) != 26 {
		return errors.New("invalid iban length")
	}

	return nil
}
