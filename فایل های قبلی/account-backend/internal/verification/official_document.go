package verification

import (
	"context"
	"errors"
	"strings"
)

// OfficialDocumentData اطلاعات سند رسمی برای اعتبارسنجی را نگهداری می‌کند.
type OfficialDocumentData struct {
	DocumentType   string
	DocumentNumber string
	OwnerID        string
}

// OfficialDocumentVerifier منطق اعتبارسنجی اسناد رسمی را مدیریت می‌کند.
type OfficialDocumentVerifier struct {
	providers *ProviderManager
}

// NewOfficialDocumentVerifier یک OfficialDocumentVerifier جدید ایجاد می‌کند.
func NewOfficialDocumentVerifier(providers *ProviderManager) *OfficialDocumentVerifier {
	return &OfficialDocumentVerifier{
		providers: providers,
	}
}

// VerifyOfficialDocument اعتبارسنجی سند رسمی را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *OfficialDocumentVerifier) VerifyOfficialDocument(
	ctx context.Context,
	userID string,
	providerName string,
	data *OfficialDocumentData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("official document data is nil")
	}

	if err := validateOfficialDocumentData(data); err != nil {
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
		VerificationType: VerificationTypeOfficialDocument,
		Data: map[string]string{
			"document_type":   data.DocumentType,
			"document_number": data.DocumentNumber,
			"owner_id":        data.OwnerID,
		},
	}

	return provider.Verify(ctx, request)
}

// validateOfficialDocumentData اطلاعات سند رسمی را بررسی می‌کند.
func validateOfficialDocumentData(data *OfficialDocumentData) error {
	if strings.TrimSpace(data.DocumentType) == "" {
		return errors.New("document type is empty")
	}

	if strings.TrimSpace(data.DocumentNumber) == "" {
		return errors.New("document number is empty")
	}

	if strings.TrimSpace(data.OwnerID) == "" {
		return errors.New("owner id is empty")
	}

	return nil
}
