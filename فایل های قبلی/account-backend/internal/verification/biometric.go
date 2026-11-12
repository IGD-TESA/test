package verification

import (
	"context"
	"errors"
	"strings"
)

// BiometricData اطلاعات موردنیاز برای احراز بیومتریک را نگهداری می‌کند.
type BiometricData struct {
	FaceImageReference string
	LivenessReference  string
}

// BiometricVerifier منطق احراز بیومتریک را مدیریت می‌کند.
type BiometricVerifier struct {
	providers *ProviderManager
}

// NewBiometricVerifier یک BiometricVerifier جدید ایجاد می‌کند.
func NewBiometricVerifier(providers *ProviderManager) *BiometricVerifier {
	return &BiometricVerifier{
		providers: providers,
	}
}

// VerifyBiometric احراز بیومتریک را از طریق Provider انتخاب‌شده انجام می‌دهد.
func (v *BiometricVerifier) VerifyBiometric(
	ctx context.Context,
	userID string,
	providerName string,
	data *BiometricData,
) (*ProviderResult, error) {
	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	if data == nil {
		return nil, errors.New("biometric data is nil")
	}

	if err := validateBiometricData(data); err != nil {
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
		VerificationType: VerificationTypeBiometric,
		Data: map[string]string{
			"face_image_reference": data.FaceImageReference,
			"liveness_reference":   data.LivenessReference,
		},
	}

	return provider.Verify(ctx, request)
}

// validateBiometricData اطلاعات بیومتریک را قبل از ارسال به Provider بررسی می‌کند.
func validateBiometricData(data *BiometricData) error {
	if strings.TrimSpace(data.FaceImageReference) == "" {
		return errors.New("face image reference is empty")
	}

	if strings.TrimSpace(data.LivenessReference) == "" {
		return errors.New("liveness reference is empty")
	}

	return nil
}
