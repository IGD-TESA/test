package verification

import (
	"context"
	"errors"
	"strings"
)

// LegalEntityData اطلاعات شخص حقوقی برای احراز را نگهداری می‌کند.
type LegalEntityData struct {
	NationalID         string
	CompanyName        string
	RepresentativeName string
	RepresentativeID   string
}

// LegalEntityVerifier منطق احراز شخص حقوقی را مدیریت می‌کند.
type LegalEntityVerifier struct {
	providers *ProviderManager
}

// NewLegalEntityVerifier یک LegalEntityVerifier جدید ایجاد می‌کند.
func NewLegalEntityVerifier(providers *ProviderManager) *LegalEntityVerifier {
	return &LegalEntityVerifier{
		providers: providers,
	}
}

// VerifyLegalEntity احراز شخص حقوقی را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *LegalEntityVerifier) VerifyLegalEntity(
	ctx context.Context,
	userID string,
	providerName string,
	data *LegalEntityData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("legal entity data is nil")
	}

	if err := validateLegalEntityData(data); err != nil {
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
		VerificationType: VerificationTypeLegalEntity,
		Data: map[string]string{
			"national_id":         data.NationalID,
			"company_name":        data.CompanyName,
			"representative_name": data.RepresentativeName,
			"representative_id":   data.RepresentativeID,
		},
	}

	return provider.Verify(ctx, request)
}

// validateLegalEntityData اطلاعات شخص حقوقی را بررسی می‌کند.
func validateLegalEntityData(data *LegalEntityData) error {
	if strings.TrimSpace(data.NationalID) == "" {
		return errors.New("national id is empty")
	}

	if strings.TrimSpace(data.CompanyName) == "" {
		return errors.New("company name is empty")
	}

	if strings.TrimSpace(data.RepresentativeName) == "" {
		return errors.New("representative name is empty")
	}

	if strings.TrimSpace(data.RepresentativeID) == "" {
		return errors.New("representative id is empty")
	}

	return nil
}
