$ErrorActionPreference = "Stop"

$serviceFile = ".\internal\verification\service.go"

if (-not (Test-Path $serviceFile)) {
    throw "File not found: $serviceFile"
}

$content = Get-Content $serviceFile -Raw

# ---------------------------------------------------------
# Check whether expiration is already connected
# ---------------------------------------------------------

if ($content.Contains("verification.ExpiresAt = &expiresAt")) {
    Write-Host "[INFO] Verification expiration logic already exists."
    exit 0
}

# ---------------------------------------------------------
# Locate ExecuteVerification
# ---------------------------------------------------------

$methodStart = $content.IndexOf(
    "func (s *Service) ExecuteVerification("
)

if ($methodStart -lt 0) {
    throw "ExecuteVerification method was not found."
}

$methodEnd = $content.IndexOf(
    "`n}",
    $methodStart
)

if ($methodEnd -lt 0) {
    throw "End of ExecuteVerification method was not found."
}

$methodContent = $content.Substring(
    $methodStart,
    $methodEnd - $methodStart
)

# ---------------------------------------------------------
# Locate VerifiedAt assignment inside ExecuteVerification
# ---------------------------------------------------------

$verifiedAssignment = 'verification.VerifiedAt = &now'

$assignmentPosition = $methodContent.IndexOf(
    $verifiedAssignment
)

if ($assignmentPosition -lt 0) {
    throw "VerifiedAt assignment inside ExecuteVerification was not found."
}

# Find the end of the line containing VerifiedAt assignment
$lineEnd = $methodContent.IndexOf(
    "`n",
    $assignmentPosition
)

if ($lineEnd -lt 0) {
    throw "End of VerifiedAt assignment line was not found."
}

# ---------------------------------------------------------
# Insert ExpiresAt immediately after VerifiedAt assignment
# ---------------------------------------------------------

$expirationCode = @"
		expiresAt := now.Add(time.Hour)
		verification.ExpiresAt = &expiresAt
"@

$absoluteInsertPosition = $methodStart + $lineEnd + 1

$content = `
    $content.Substring(0, $absoluteInsertPosition) +
    $expirationCode + "`r`n" +
    $content.Substring($absoluteInsertPosition)

Set-Content `
    -Path $serviceFile `
    -Value $content `
    -Encoding UTF8

Write-Host "[OK] Verification expiration logic added."

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
# Tests
# ---------------------------------------------------------

Write-Host ""
Write-Host "[2/2] Running Go tests..."

go test ./...

if ($LASTEXITCODE -ne 0) {
    throw "Go tests failed."
}

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION EXPIRATION CONNECTION PASSED"
Write-Host "========================================"
Write-Host ""