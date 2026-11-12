package verification

import (
	"context"
	"errors"
)

// TestProvider ÛŒÚ© Provider Ø¯Ø§Ø®Ù„ÛŒ Ø¨Ø±Ø§ÛŒ ØªØ³Øª Verification Ø§Ø³Øª.
type TestProvider struct{}

// NewTestProvider ÛŒÚ© TestProvider Ø¬Ø¯ÛŒØ¯ Ø§ÛŒØ¬Ø§Ø¯ Ù…ÛŒâ€ŒÚ©Ù†Ø¯.
func NewTestProvider() *TestProvider {
	return &TestProvider{}
}

// Name Ù†Ø§Ù… Provider Ø±Ø§ Ø¨Ø±Ù…ÛŒâ€ŒÚ¯Ø±Ø¯Ø§Ù†Ø¯.
func (p *TestProvider) Name() string {
	return "test-provider"
}

// Verify Ø¹Ù…Ù„ÛŒØ§Øª Verification Ø¢Ø²Ù…Ø§ÛŒØ´ÛŒ Ø±Ø§ Ø§Ù†Ø¬Ø§Ù… Ù…ÛŒâ€ŒØ¯Ù‡Ø¯.
func (p *TestProvider) Verify(
	ctx context.Context,
	request *ProviderRequest,
) (*ProviderResult, error) {

	if request == nil {
		return nil, errors.New("provider request is nil")
	}

	if request.UserID == "" {
		return nil, errors.New("user id is empty")
	}

	if request.VerificationType == "" {
		return nil, errors.New("verification type is empty")
	}

	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	status := VerificationStatusVerified

	if request.Data != nil {
		switch request.Data["test_result"] {
		case "":
			status = VerificationStatusVerified

		case "verified":
			status = VerificationStatusVerified

		case "rejected":
			status = VerificationStatusRejected

		case "failed":
			status = VerificationStatusFailed

		case "manual_review":
			status = VerificationStatusManualReview

		case "pending":
			status = VerificationStatusPending

		default:
			return nil, errors.New("invalid test result")
		}
	}

	result := &ProviderResult{
		Status:            status,
		ReferenceID:       request.ReferenceID,
		VerificationLevel: VerificationLevelBasic,
	}

	if status == VerificationStatusRejected {
		result.RejectionReason = "test rejection"
	}

	return result, nil
}
