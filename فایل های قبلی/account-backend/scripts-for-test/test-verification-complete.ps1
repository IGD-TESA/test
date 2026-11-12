$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION STATUS E2E TEST"
Write-Host "========================================"
Write-Host ""

$baseUrl = "http://localhost:8080"
$executeUrl = "$baseUrl/api/v1/verifications/execute"

# =========================================================
# 1. Backend check
# =========================================================

Write-Host "[1] Checking backend..."

try {
    Invoke-RestMethod `
        -Uri "$baseUrl/health" `
        -Method Get `
        -TimeoutSec 5 | Out-Null

    Write-Host "[OK] Backend is running."
}
catch {
    Write-Host ""
    Write-Host "[FAILED] Backend is not reachable."
    Write-Host ""
    exit 1
}

# =========================================================
# 2. Create fresh test user
# =========================================================

function New-TestUser {

    $body = @{
        user_type = "individual"
    } | ConvertTo-Json

    $response = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/users" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10

    if ([string]::IsNullOrWhiteSpace($response.id)) {
        throw "User ID was not returned."
    }

    return $response.id
}

# =========================================================
# 3. Test one verification status
# =========================================================

function Test-VerificationStatus {

    param (
        [string]$StatusName,
        [string]$VerificationType,
        [string]$ExpectedStatus
    )

    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host "Testing status: $StatusName"
    Write-Host "Verification type: $VerificationType"
    Write-Host "----------------------------------------"

    try {

        # Create a NEW user for every test.
        $userId = New-TestUser

        Write-Host "User ID: $userId"

        $body = @{
            user_id = $userId
            verification_type = $VerificationType
            provider = "test-provider"
            data = @{
                test_result = $ExpectedStatus
            }
        } | ConvertTo-Json

        $result = Invoke-RestMethod `
            -Uri $executeUrl `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10

        Write-Host "[OK] Request completed."

        # -------------------------------------------------
        # Validate status
        # -------------------------------------------------

        if ($result.status -ne $ExpectedStatus) {

            Write-Host ""
            Write-Host "[FAILED] Status mismatch."
            Write-Host "Expected: $ExpectedStatus"
            Write-Host "Actual:   $($result.status)"

            return $false
        }

        Write-Host "[OK] Status response validated."

        # -------------------------------------------------
        # Non-verified statuses must not expire
        # -------------------------------------------------

        if ($null -ne $result.expires_at) {

            Write-Host ""
            Write-Host "[FAILED] expires_at should be null."
            Write-Host "Actual: $($result.expires_at)"

            return $false
        }

        Write-Host "[OK] expires_at is null."

        # -------------------------------------------------
        # Rejected must have rejection_reason
        # -------------------------------------------------

        if ($ExpectedStatus -eq "rejected") {

            if ([string]::IsNullOrWhiteSpace($result.rejection_reason)) {

                Write-Host ""
                Write-Host "[FAILED] rejection_reason is missing."

                return $false
            }

            Write-Host "[OK] rejection_reason exists."
        }

        # -------------------------------------------------
        # Final result
        # -------------------------------------------------

        Write-Host "[OK] $StatusName PASSED."
        Write-Host "Verification ID: $($result.id)"

        return $true
    }
    catch {

        Write-Host ""
        Write-Host "[FAILED] $StatusName"
        Write-Host "HTTP ERROR: $($_.Exception.Message)"

        if ($_.ErrorDetails.Message) {

            Write-Host ""
            Write-Host "API RESPONSE:"
            Write-Host $_.ErrorDetails.Message
        }

        return $false
    }
}

# =========================================================
# 4. Run tests
# =========================================================

$passed = 0
$failed = 0

# Rejected
if (Test-VerificationStatus `
    -StatusName "rejected" `
    -VerificationType "contact" `
    -ExpectedStatus "rejected") {

    $passed++
}
else {
    $failed++
}

# Failed
if (Test-VerificationStatus `
    -StatusName "failed" `
    -VerificationType "bank" `
    -ExpectedStatus "failed") {

    $passed++
}
else {
    $failed++
}

# Manual Review
if (Test-VerificationStatus `
    -StatusName "manual_review" `
    -VerificationType "biometric" `
    -ExpectedStatus "manual_review") {

    $passed++
}
else {
    $failed++
}

# Pending
if (Test-VerificationStatus `
    -StatusName "pending" `
    -VerificationType "document" `
    -ExpectedStatus "pending") {

    $passed++
}
else {
    $failed++
}

# =========================================================
# 5. Final result
# =========================================================

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION STATUS TEST RESULT"
Write-Host "========================================"
Write-Host ""
Write-Host "Passed: $passed"
Write-Host "Failed: $failed"

if ($failed -eq 0) {

    Write-Host ""
    Write-Host "VERIFICATION STATUS E2E TEST PASSED"
    exit 0
}

Write-Host ""
Write-Host "VERIFICATION STATUS E2E TEST FAILED"
exit 1