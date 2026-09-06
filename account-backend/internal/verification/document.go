package verification

import (
	"context"
	"errors"
	"strings"
)

// DocumentData اطلاعات مدرک هویتی را نگهداری می‌کند.
type DocumentData struct {
	DocumentType   string
	DocumentNumber string
}

// DocumentVerifier منطق اعتبارسنجی مدرک هویتی را مدیریت می‌کند.
type DocumentVerifier struct {
	providers *ProviderManager
}

// NewDocumentVerifier یک DocumentVerifier جدید ایجاد می‌کند.
func NewDocumentVerifier(providers *ProviderManager) *DocumentVerifier {
	return &DocumentVerifier{
		providers: providers,
	}
}

// VerifyDocument اعتبارسنجی مدرک هویتی را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *DocumentVerifier) VerifyDocument(
	ctx context.Context,
	userID string,
	providerName string,
	data *DocumentData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("document data is nil")
	}

	if err := validateDocumentData(data); err != nil {
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
		VerificationType: VerificationTypeDocument,
		Data: map[string]string{
			"document_type":   data.DocumentType,
			"document_number": data.DocumentNumber,
		},
	}

	return provider.Verify(ctx, request)
}

// validateDocumentData اطلاعات مدرک را قبل از ارسال به Provider بررسی می‌کند.
func validateDocumentData(data *DocumentData) error {
	documentType := strings.TrimSpace(data.DocumentType)
	documentNumber := strings.TrimSpace(data.DocumentNumber)

	if documentType == "" {
		return errors.New("document type is empty")
	}

	if documentNumber == "" {
		return errors.New("document number is empty")
	}

	return nil
}
