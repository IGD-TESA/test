$ErrorActionPreference = "Stop"

$providerFile = ".\internal\verification\test_provider.go"
$mainFile = ".\cmd\server\main.go"
$backupFile = ".\cmd\server\main.go.backup-before-test-provider"

Write-Host ""
Write-Host "========================================"
Write-Host "CONNECT TEST PROVIDER"
Write-Host "========================================"
Write-Host ""

if (-not (Test-Path $mainFile)) {
    throw "main.go not found."
}

Copy-Item $mainFile $backupFile -Force

Write-Host "[OK] Backup created:"
Write-Host "     $backupFile"

# =========================================================
# Create Test Provider
# =========================================================

$providerCode = @'
package verification

import (
	"context"
	"errors"
)

// TestProvider یک Provider داخلی برای تست Verification است.
type TestProvider struct{}

// NewTestProvider یک TestProvider جدید ایجاد می‌کند.
func NewTestProvider() *TestProvider {
	return &TestProvider{}
}

// Name نام Provider را برمی‌گرداند.
func (p *TestProvider) Name() string {
	return "test-provider"
}

// Verify عملیات Verification آزمایشی را انجام می‌دهد.
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
'@

Set-Content `
    -Path $providerFile `
    -Value $providerCode `
    -Encoding UTF8

Write-Host "[OK] Test Provider created."

# =========================================================
# Register Provider in main.go
# =========================================================

$content = Get-Content $mainFile -Raw

if ($content -notmatch 'verificationProviders\.Register') {

    $pattern = '(?m)^(\s*verificationCache\s*:=\s*verification\.NewCache\()'

    if ($content -notmatch $pattern) {
        Copy-Item $backupFile $mainFile -Force
        throw "Verification cache initialization not found."
    }

    $registration = @'
        testProvider := verification.NewTestProvider()

        if err := verificationProviders.Register(
                testProvider,
        ); err != nil {
                log.Fatalf(
                        "Verification test provider registration error: %v",
                        err,
                )
        }

'@

    $content = [regex]::Replace(
        $content,
        $pattern,
        $registration + '$1',
        1
    )

    Write-Host "[OK] Test Provider registered."
}
else {
    Write-Host "[SKIP] Test Provider already registered."
}

# =========================================================
# Validate
# =========================================================

if ((Get-Content $providerFile -Raw) -notmatch 'type TestProvider struct') {
    Copy-Item $backupFile $mainFile -Force
    throw "Test Provider file validation failed."
}

if ($content -notmatch 'verification\.NewTestProvider') {
    Copy-Item $backupFile $mainFile -Force
    throw "Test Provider registration validation failed."
}

Write-Host "[OK] Validation passed."

# =========================================================
# Write
# =========================================================

Set-Content `
    -Path $mainFile `
    -Value $content `
    -Encoding UTF8

Write-Host "[OK] main.go updated."

# =========================================================
# Format
# =========================================================

gofmt -w $providerFile
gofmt -w $mainFile

if ($LASTEXITCODE -ne 0) {
    Copy-Item $backupFile $mainFile -Force
    throw "gofmt failed. Original main.go restored."
}

Write-Host "[OK] gofmt completed."

# =========================================================
# Test
# =========================================================

Write-Host ""
Write-Host "Running Go tests..."
Write-Host ""

go test ./...

if ($LASTEXITCODE -ne 0) {
    Copy-Item $backupFile $mainFile -Force

    Write-Host ""
    Write-Host "[FAILED] Go tests failed." -ForegroundColor Red
    Write-Host "[OK] Original main.go restored."

    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "TEST PROVIDER CONNECTED"
Write-Host "========================================"
Write-Host ""

Write-Host "Provider: test-provider"
Write-Host ""

Write-Host "Supported results:"
Write-Host "  verified"
Write-Host "  rejected"
Write-Host "  failed"
Write-Host "  manual_review"
Write-Host "  pending"

Write-Host ""
Write-Host "[DONE]"