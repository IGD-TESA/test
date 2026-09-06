$ErrorActionPreference = "Stop"

$serviceFile = ".\internal\verification\service.go"

if (-not (Test-Path $serviceFile)) {
    throw "File not found: $serviceFile"
}

$content = Get-Content $serviceFile -Raw

# ---------------------------------------------------------
# Check whether reuse logic already exists
# ---------------------------------------------------------

if ($content.Contains("existingVerification")) {
    Write-Host "[INFO] Verification reuse logic already exists."
    exit 0
}

# ---------------------------------------------------------
# Locate ExecuteVerification
# ---------------------------------------------------------

$methodStart = $content.IndexOf(
    "func (s *Service) ExecuteVerification("
)

if ($methodStart -lt 0) {
    throw "ExecuteVerification method was not found in service.go"
}

# Find the provider lookup only AFTER ExecuteVerification starts.
$providerText = @"
	provider, err := s.providers.Get(providerName)
"@

$providerStart = $content.IndexOf(
    $providerText,
    $methodStart
)

if ($providerStart -lt 0) {
    throw "Provider lookup inside ExecuteVerification was not found."
}

# ---------------------------------------------------------
# Build reuse logic
# ---------------------------------------------------------

$reuseBlock = @"
	// Check whether a valid previous verification can be reused.
	existingVerification, err := s.GetLatestVerification(
		ctx,
		userID,
		verificationType,
	)

	if err == nil && existingVerification != nil {
		if existingVerification.IsValid(time.Now()) {
			return existingVerification, nil
		}
	}

"@

# ---------------------------------------------------------
# Insert reuse logic immediately before provider lookup
# ---------------------------------------------------------

$content = `
    $content.Substring(0, $providerStart) +
    $reuseBlock +
    $content.Substring($providerStart)

Set-Content `
    -Path $serviceFile `
    -Value $content `
    -Encoding UTF8

Write-Host "[OK] Verification reuse logic added."

# ---------------------------------------------------------
# Format
# ---------------------------------------------------------

Write-Host ""
Write-Host "[1/2] Running gofmt..."

gofmt -w $serviceFile

if ($LASTEXITCODE -ne 0) {
    throw "gofmt failed."
}

Write-Host "[OK] gofmt completed."

# ---------------------------------------------------------
# Go tests
# ---------------------------------------------------------

Write-Host ""
Write-Host "[2/2] Running Go tests..."

go test ./...

if ($LASTEXITCODE -ne 0) {
    throw "Go tests failed."
}

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION REUSE CONNECTION PASSED"
Write-Host "========================================"
Write-Host ""