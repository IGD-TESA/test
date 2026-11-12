$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION REUSE E2E TEST"
Write-Host "========================================"
Write-Host ""

$baseUrl = "http://localhost:8080"
$executeUrl = "$baseUrl/api/v1/verifications/execute"

$testUserId = "f062c552-66b4-40b1-9cfd-332fad0221ce"

# ---------------------------------------------------------
# 1. Backend check
# ---------------------------------------------------------

Write-Host "[1] Checking backend..."

try {
    Invoke-RestMethod `
        -Uri "$baseUrl/health" `
        -Method Get `
        -TimeoutSec 5 | Out-Null

    Write-Host "[OK] Backend is running."
}
catch {
    Write-Host "[FAILED] Backend is not reachable." -ForegroundColor Red
    Write-Host ""
    Write-Host "Start the backend first:"
    Write-Host "go run .\cmd\server"
    Write-Host ""
    exit 1
}

Write-Host ""

# ---------------------------------------------------------
# 2. First verification
# ---------------------------------------------------------

Write-Host "[2] Creating first verification..."
Write-Host ""

$body = @{
    user_id = $testUserId
    verification_type = "identity"
    provider = "test-provider"
    data = @{
        test_result = "verified"
    }
} | ConvertTo-Json

try {

    $first = Invoke-RestMethod `
        -Uri $executeUrl `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10

    Write-Host "[OK] First verification completed."
    Write-Host "First Verification ID:"
    Write-Host $first.id
    Write-Host ""

}
catch {

    Write-Host "[FAILED] First verification failed." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# ---------------------------------------------------------
# Validate first verification
# ---------------------------------------------------------

if ([string]::IsNullOrWhiteSpace($first.id)) {
    throw "First verification ID is empty."
}

if ($first.status -ne "verified") {
    throw "First verification status is not verified."
}

if ($first.user_id -ne $testUserId) {
    throw "First verification user_id mismatch."
}

if ($first.verification_type -ne "identity") {
    throw "First verification type mismatch."
}

Write-Host "[OK] First verification validated."
Write-Host ""

# ---------------------------------------------------------
# 3. Second verification request
# ---------------------------------------------------------

Write-Host "[3] Sending second verification request..."
Write-Host ""

try {

    $second = Invoke-RestMethod `
        -Uri $executeUrl `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10

    Write-Host "[OK] Second request completed."
    Write-Host "Second Verification ID:"
    Write-Host $second.id
    Write-Host ""

}
catch {

    Write-Host "[FAILED] Second verification failed." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# ---------------------------------------------------------
# 4. Validate second verification
# ---------------------------------------------------------

if ([string]::IsNullOrWhiteSpace($second.id)) {
    throw "Second verification ID is empty."
}

if ($second.status -ne "verified") {
    throw "Second verification status is not verified."
}

if ($second.user_id -ne $testUserId) {
    throw "Second verification user_id mismatch."
}

if ($second.verification_type -ne "identity") {
    throw "Second verification type mismatch."
}

Write-Host "[OK] Second verification validated."
Write-Host ""

# ---------------------------------------------------------
# 5. Verify reuse
# ---------------------------------------------------------

Write-Host "[4] Checking Verification reuse..."
Write-Host ""

if ($first.id -ne $second.id) {

    Write-Host "[FAILED] Verification was NOT reused." -ForegroundColor Red
    Write-Host ""
    Write-Host "First ID :  $($first.id)"
    Write-Host "Second ID:  $($second.id)"
    Write-Host ""

    exit 1
}

Write-Host "[OK] Verification was reused."
Write-Host ""
Write-Host "First ID :  $($first.id)"
Write-Host "Second ID:  $($second.id)"
Write-Host ""
Write-Host "The two IDs are identical."
Write-Host "Provider did not need to create a new verification record."
Write-Host ""

# ---------------------------------------------------------
# Final result
# ---------------------------------------------------------

Write-Host "========================================"
Write-Host "VERIFICATION REUSE E2E TEST PASSED"
Write-Host "========================================"
Write-Host ""