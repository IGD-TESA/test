# ============================================================
# Account Backend
# User Phone Integration Test
# ============================================================

$ErrorActionPreference = "Stop"

$BaseUrl = "http://localhost:8080"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       USER PHONE INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""


# ============================================================
# Helper
# ============================================================

function Test-ApiResponse {
    param (
        [string]$Step,
        [int]$ExpectedStatus,
        $Response,
        [int]$ActualStatus
    )

    if ($ActualStatus -ne $ExpectedStatus) {

        Write-Host ""
        Write-Host "FAILED: $Step" -ForegroundColor Red
        Write-Host "Expected HTTP status: $ExpectedStatus" -ForegroundColor Red
        Write-Host "Actual HTTP status:   $ActualStatus" -ForegroundColor Red

        if ($Response) {
            Write-Host ""
            Write-Host "Response:" -ForegroundColor Yellow
            $Response | ConvertTo-Json -Depth 10
        }

        throw "API test failed."
    }

    Write-Host "$Step : OK" -ForegroundColor Green
}


# ============================================================
# 1. Check Backend
# ============================================================

Write-Host "[1/4] Checking Account Backend..." `
    -ForegroundColor Yellow

try {

    $HealthResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/health" `
        -Method GET `
        -UseBasicParsing

}
catch {

    throw `
        "Account Backend is not reachable at $BaseUrl. Make sure the server is running."
}

if ($HealthResponse.StatusCode -ne 200) {

    throw `
        "Backend health check failed."
}

Write-Host "Backend: OK" -ForegroundColor Green


# ============================================================
# 2. Create Test User
# ============================================================

Write-Host ""
Write-Host "[2/4] Creating test user..." `
    -ForegroundColor Yellow


$UserBody = @{
    user_type = "individual"
} | ConvertTo-Json


try {

    $UserResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/api/v1/users" `
        -Method POST `
        -ContentType "application/json" `
        -Body $UserBody `
        -UseBasicParsing

}
catch {

    Write-Host ""
    Write-Host "Create user failed." -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }

    throw
}


$User = $UserResponse.Content | ConvertFrom-Json

$UserID = $User.id


if ([string]::IsNullOrWhiteSpace($UserID)) {

    throw `
        "User was created but user ID was not returned."
}


Write-Host "User created successfully." `
    -ForegroundColor Green

Write-Host "User ID: $UserID"


# ============================================================
# 3. Create User Phone
# ============================================================

Write-Host ""
Write-Host "[3/4] Creating user phone..." `
    -ForegroundColor Yellow


# Generate a random 11-digit Iranian-style test number
$RandomNumber = Get-Random `
    -Minimum 100000000 `
    -Maximum 999999999

$PhoneNumber = "09$RandomNumber"


$PhoneBody = @{
    user_id      = $UserID
    phone_number = $PhoneNumber
    is_primary   = $true
} | ConvertTo-Json


try {

    $PhoneResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/api/v1/users/phone" `
        -Method POST `
        -ContentType "application/json" `
        -Body $PhoneBody `
        -UseBasicParsing

}
catch {

    Write-Host ""
    Write-Host "Create phone failed." `
        -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }

    throw
}


$Phone = $PhoneResponse.Content | ConvertFrom-Json


if ([string]::IsNullOrWhiteSpace($Phone.id)) {

    throw `
        "Phone was created but phone ID was not returned."
}


Write-Host "Phone created successfully." `
    -ForegroundColor Green

Write-Host "Phone ID:     $($Phone.id)"
Write-Host "Phone Number: $($Phone.phone_number)"
Write-Host "Is Primary:   $($Phone.is_primary)"
Write-Host "Is Verified:  $($Phone.is_verified)"


# ============================================================
# 4. Get User Phones
# ============================================================

Write-Host ""
Write-Host "[4/4] Reading user phones..." `
    -ForegroundColor Yellow


try {

    $PhonesResponse = Invoke-WebRequest `
        -Uri "$BaseUrl/api/v1/users/$UserID/phones" `
        -Method GET `
        -UseBasicParsing

}
catch {

    Write-Host ""
    Write-Host "Get phones failed." `
        -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }

    throw
}


$Phones = $PhonesResponse.Content | ConvertFrom-Json


if ($null -eq $Phones) {

    throw `
        "API returned an empty response."
}


# Make sure result is treated as an array
$PhoneList = @($Phones)


$FoundPhone = $PhoneList |
    Where-Object {
        $_.id -eq $Phone.id
    }


if ($null -eq $FoundPhone) {

    throw `
        "Created phone was not found in GET /phones response."
}


if ($FoundPhone.user_id -ne $UserID) {

    throw `
        "Phone user_id does not match created user ID."
}


if ($FoundPhone.phone_number -ne $PhoneNumber) {

    throw `
        "Phone number does not match created phone."
}


Write-Host "User phones retrieved successfully." `
    -ForegroundColor Green

Write-Host ""
Write-Host "Retrieved phones:" `
    -ForegroundColor Cyan

$PhoneList |
    Select-Object `
        id,
        user_id,
        phone_number,
        is_primary,
        is_verified,
        verified_at |
    Format-Table -AutoSize


# ============================================================
# Final Result
# ============================================================

Write-Host ""
Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host "          TEST RESULT" `
    -ForegroundColor Green

Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host ""

Write-Host "User ID       : $UserID"
Write-Host "Phone ID      : $($Phone.id)"
Write-Host "Phone Number  : $PhoneNumber"
Write-Host "Is Primary    : $($Phone.is_primary)"
Write-Host "Is Verified   : $($Phone.is_verified)"
Write-Host "Phones Found  : $($PhoneList.Count)"

Write-Host ""

Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host "       USER PHONE TEST PASSED" `
    -ForegroundColor Green

Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host ""