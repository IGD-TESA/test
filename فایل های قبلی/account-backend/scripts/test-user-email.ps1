# =========================================================
# USER EMAIL INTEGRATION TEST
# =========================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       USER EMAIL INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080"

# =========================================================
# [1/4] Checking Account Backend
# =========================================================

Write-Host "[1/4] Checking Account Backend..." -ForegroundColor Yellow

try {

    $health = Invoke-RestMethod `
        -Uri "$baseUrl/health" `
        -Method Get

    if ($health.status -ne "ok") {
        throw "Backend health status is not OK."
    }

    Write-Host "Backend: OK" -ForegroundColor Green

}
catch {

    Write-Host "ERROR: Account Backend is not available." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    exit 1
}

Write-Host ""

# =========================================================
# [2/4] Creating test user
# =========================================================

Write-Host "[2/4] Creating test user..." -ForegroundColor Yellow

try {

    $userBody = @{
        user_type = "individual"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/users" `
        -Method Post `
        -ContentType "application/json" `
        -Body $userBody

    if ([string]::IsNullOrWhiteSpace($userResponse.id)) {
        throw "User ID was not returned."
    }

    $userId = $userResponse.id

    Write-Host "User created successfully." -ForegroundColor Green
    Write-Host "User ID: $userId"

}
catch {

    Write-Host "ERROR: Failed to create test user." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    exit 1
}

Write-Host ""

# =========================================================
# Generate test email
# =========================================================

$randomNumber = Get-Random -Minimum 10000 -Maximum 99999

$testEmail = "test.user.$randomNumber@example.com"

# =========================================================
# [3/4] Creating user email
# =========================================================

Write-Host "[3/4] Creating user email..." -ForegroundColor Yellow

try {

    $emailBody = @{
        user_id    = $userId
        email      = $testEmail
        is_primary = $true
    } | ConvertTo-Json

    $emailResponse = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/users/email" `
        -Method Post `
        -ContentType "application/json" `
        -Body $emailBody

    if ([string]::IsNullOrWhiteSpace($emailResponse.id)) {
        throw "Email ID was not returned."
    }

    if ($emailResponse.user_id -ne $userId) {
        throw "Returned user_id does not match created user."
    }

    if ($emailResponse.email -ne $testEmail) {
        throw "Returned email does not match created email."
    }

    Write-Host "Email created successfully." -ForegroundColor Green
    Write-Host "Email ID:     $($emailResponse.id)"
    Write-Host "Email:        $($emailResponse.email)"
    Write-Host "Is Primary:   $($emailResponse.is_primary)"
    Write-Host "Is Verified:  $($emailResponse.is_verified)"

    $emailId = $emailResponse.id

}
catch {

    Write-Host "ERROR: Failed to create user email." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    exit 1
}

Write-Host ""

# =========================================================
# [4/4] Reading user emails
# =========================================================

Write-Host "[4/4] Reading user emails..." -ForegroundColor Yellow

try {

    $emailsResponse = Invoke-RestMethod `
        -Uri "$baseUrl/api/v1/users/$userId/emails" `
        -Method Get

    if ($null -eq $emailsResponse) {
        throw "No response received."
    }

    Write-Host "User emails retrieved successfully." -ForegroundColor Green
    Write-Host ""

    Write-Host "Retrieved emails:"
    Write-Host ""

    $emailsResponse | Format-Table `
        id,
        user_id,
        email,
        is_primary,
        is_verified,
        verified_at

    # -----------------------------------------------------
    # Verify that created email exists
    # -----------------------------------------------------

    $foundEmail = $emailsResponse |
        Where-Object {
            $_.id -eq $emailId
        }

    if ($null -eq $foundEmail) {
        throw "Created email was not found in user's email list."
    }

    if ($foundEmail.user_id -ne $userId) {
        throw "Retrieved user_id does not match."
    }

    if ($foundEmail.email -ne $testEmail) {
        throw "Retrieved email does not match."
    }

    if ($foundEmail.is_primary -ne $true) {
        throw "Email is_primary should be true."
    }

    if ($foundEmail.is_verified -ne $false) {
        throw "Email is_verified should initially be false."
    }

}
catch {

    Write-Host "ERROR: Failed to retrieve or validate user emails." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    exit 1
}

# =========================================================
# Test Result
# =========================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "          TEST RESULT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "User ID       : $userId"
Write-Host "Email ID      : $emailId"
Write-Host "Email         : $testEmail"
Write-Host "Is Primary    : $($foundEmail.is_primary)"
Write-Host "Is Verified   : $($foundEmail.is_verified)"
Write-Host "Emails Found  : $($emailsResponse.Count)"
Write-Host ""

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       USER EMAIL TEST PASSED" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "NOTE:" -ForegroundColor Yellow
Write-Host "Test records were NOT deleted."
Write-Host ""