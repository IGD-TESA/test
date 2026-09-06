$ErrorActionPreference = "Stop"

$BaseUrl = "http://localhost:8080"

$Passed = 0
$Failed = 0

function Write-TestResult {
    param(
        [string]$Name,
        [bool]$Success
    )

    if ($Success) {
        Write-Host ("[PASS] " + $Name) -ForegroundColor Green
        $script:Passed++
    }
    else {
        Write-Host ("[FAIL] " + $Name) -ForegroundColor Red
        $script:Failed++
    }
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = ""
    )

    try {
        if ($Body -ne "") {
            $Response = Invoke-WebRequest `
                -Uri $Url `
                -Method $Method `
                -ContentType "application/json" `
                -Body $Body `
                -UseBasicParsing

        }
        else {
            $Response = Invoke-WebRequest `
                -Uri $Url `
                -Method $Method `
                -UseBasicParsing
        }

        return @{
            Success    = $true
            StatusCode = [int]$Response.StatusCode
            Body       = $Response.Content
            Error      = ""
        }
    }
    catch {
        $StatusCode = 0
        $ResponseBody = ""

        if ($_.Exception.Response) {
            try {
                $StatusCode = [int]$_.Exception.Response.StatusCode
            }
            catch {
                $StatusCode = 0
            }

            try {
                $Stream = $_.Exception.Response.GetResponseStream()

                if ($Stream) {
                    $Reader = New-Object System.IO.StreamReader($Stream)
                    $ResponseBody = $Reader.ReadToEnd()
                    $Reader.Close()
                    $Stream.Close()
                }
            }
            catch {
                $ResponseBody = ""
            }
        }

        return @{
            Success    = $false
            StatusCode = $StatusCode
            Body       = $ResponseBody
            Error      = $_.Exception.Message
        }
    }
}

function Assert-ApiSuccess {
    param(
        [string]$Name,
        $Result,
        [int[]]$ExpectedStatusCodes
    )

    $Success = $false

    if ($Result.Success -and
        $ExpectedStatusCodes -contains $Result.StatusCode) {

        $Success = $true
    }

    Write-TestResult $Name $Success

    if (-not $Success) {
        Write-Host ""
        Write-Host "  HTTP Status : $($Result.StatusCode)" -ForegroundColor Yellow

        if ($Result.Body -ne "") {
            Write-Host "  Response:" -ForegroundColor Yellow
            Write-Host "  $($Result.Body)" -ForegroundColor Yellow
        }

        if ($Result.Error -ne "") {
            Write-Host "  Error:" -ForegroundColor Yellow
            Write-Host "  $($Result.Error)" -ForegroundColor Yellow
        }

        Write-Host ""
    }

    return $Success
}

Write-Host ""
Write-Host "============================================================"
Write-Host "ACCOUNT BACKEND REGRESSION TEST"
Write-Host "============================================================"
Write-Host ""

# ============================================================
# Generate unique test values
# ============================================================

$UniqueNumber = Get-Random -Minimum 10000 -Maximum 99999

$ProfileNationalID = "99000$UniqueNumber"

$LegalNationalID = "14000$UniqueNumber"

$RegistrationNumber = "9$UniqueNumber"

$EconomicCode = "400000$UniqueNumber"

$TestEmail = "test.user.$UniqueNumber@example.com"

$TestPhone = "0912$UniqueNumber"

Write-Host "Generated test values:"
Write-Host "  Profile National ID : $ProfileNationalID"
Write-Host "  Legal National ID   : $LegalNationalID"
Write-Host "  Registration Number : $RegistrationNumber"
Write-Host "  Economic Code       : $EconomicCode"
Write-Host "  Email               : $TestEmail"
Write-Host "  Phone               : $TestPhone"
Write-Host ""

# ============================================================
# 1. Health
# ============================================================

$Result = Invoke-Api `
    -Method "GET" `
    -Url "$BaseUrl/health"

Assert-ApiSuccess `
    -Name "Health" `
    -Result $Result `
    -ExpectedStatusCodes @(200) | Out-Null

# ============================================================
# 2. Ready
# ============================================================

$Result = Invoke-Api `
    -Method "GET" `
    -Url "$BaseUrl/ready"

Assert-ApiSuccess `
    -Name "Ready" `
    -Result $Result `
    -ExpectedStatusCodes @(200) | Out-Null

# ============================================================
# 3. Create Individual User
# ============================================================

$CreateUserBody = @{
    user_type = "individual"
} | ConvertTo-Json

$Result = Invoke-Api `
    -Method "POST" `
    -Url "$BaseUrl/api/v1/users" `
    -Body $CreateUserBody

$CreateUserPassed = Assert-ApiSuccess `
    -Name "Create User" `
    -Result $Result `
    -ExpectedStatusCodes @(201)

$UserID = ""

if ($CreateUserPassed) {
    try {
        $User = $Result.Body | ConvertFrom-Json
        $UserID = $User.id
    }
    catch {
        Write-Host "  Failed to parse user response." -ForegroundColor Yellow
    }
}

# ============================================================
# 4. Get User
# ============================================================

if ($UserID -ne "") {

    $Result = Invoke-Api `
        -Method "GET" `
        -Url "$BaseUrl/api/v1/users/$UserID"

    Assert-ApiSuccess `
        -Name "Get User" `
        -Result $Result `
        -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Write-TestResult "Get User" $false
    Write-Host "  User ID is empty." -ForegroundColor Yellow
}

# ============================================================
# 5. Create User Profile
# ============================================================

if ($UserID -ne "") {

    $ProfileBody = @{
        user_id     = $UserID
        first_name  = "Test"
        last_name   = "User"
        national_id = $ProfileNationalID
        birth_date  = "1990-01-01"
    } | ConvertTo-Json

    $Result = Invoke-Api `
        -Method "POST" `
        -Url "$BaseUrl/api/v1/users/profile" `
        -Body $ProfileBody

    Assert-ApiSuccess `
        -Name "Create User Profile" `
        -Result $Result `
        -ExpectedStatusCodes @(201) | Out-Null
}
else {
    Write-TestResult "Create User Profile" $false
}

# ============================================================
# 6. Get User Profile
# ============================================================

if ($UserID -ne "") {

    $Result = Invoke-Api `
        -Method "GET" `
        -Url "$BaseUrl/api/v1/users/$UserID/profile"

    Assert-ApiSuccess `
        -Name "Get User Profile" `
        -Result $Result `
        -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Write-TestResult "Get User Profile" $false
}

# ============================================================
# 7. Create Legal User
# ============================================================

$LegalUserBody = @{
    user_type = "legal"
} | ConvertTo-Json

$Result = Invoke-Api `
    -Method "POST" `
    -Url "$BaseUrl/api/v1/users" `
    -Body $LegalUserBody

$CreateLegalUserPassed = Assert-ApiSuccess `
    -Name "Create Legal User" `
    -Result $Result `
    -ExpectedStatusCodes @(201)

$LegalUserID = ""

if ($CreateLegalUserPassed) {
    try {
        $LegalUser = $Result.Body | ConvertFrom-Json
        $LegalUserID = $LegalUser.id
    }
    catch {
        Write-Host "  Failed to parse legal user response." -ForegroundColor Yellow
    }
}

# ============================================================
# 8. Create Legal Entity
# ============================================================

if ($LegalUserID -ne "") {

    $LegalEntityBody = @{
        user_id              = $LegalUserID
        legal_name           = "شرکت توسعه سبز ایران"
        national_id          = $LegalNationalID
        registration_number  = $RegistrationNumber
        economic_code        = $EconomicCode
        legal_type           = "company"
        registration_date    = "1400-01-01"
    } | ConvertTo-Json

    $Result = Invoke-Api `
        -Method "POST" `
        -Url "$BaseUrl/api/v1/users/legal-entity" `
        -Body $LegalEntityBody

    Assert-ApiSuccess `
        -Name "Create Legal Entity" `
        -Result $Result `
        -ExpectedStatusCodes @(201) | Out-Null
}
else {
    Write-TestResult "Create Legal Entity" $false
}

# ============================================================
# 9. Get Legal Entity
# ============================================================

if ($LegalUserID -ne "") {

    $Result = Invoke-Api `
        -Method "GET" `
        -Url "$BaseUrl/api/v1/users/$LegalUserID/legal-entity"

    Assert-ApiSuccess `
        -Name "Get Legal Entity" `
        -Result $Result `
        -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Write-TestResult "Get Legal Entity" $false
}

# ============================================================
# 10. Create User Phone
# ============================================================

if ($UserID -ne "") {

    $PhoneBody = @{
        user_id     = $UserID
        phone_number = $TestPhone
        is_primary  = $true
    } | ConvertTo-Json

    $Result = Invoke-Api `
        -Method "POST" `
        -Url "$BaseUrl/api/v1/users/phone" `
        -Body $PhoneBody

    Assert-ApiSuccess `
        -Name "Create User Phone" `
        -Result $Result `
        -ExpectedStatusCodes @(201) | Out-Null
}
else {
    Write-TestResult "Create User Phone" $false
}

# ============================================================
# 11. Get User Phones
# ============================================================

if ($UserID -ne "") {

    $Result = Invoke-Api `
        -Method "GET" `
        -Url "$BaseUrl/api/v1/users/$UserID/phones"

    Assert-ApiSuccess `
        -Name "Get User Phones" `
        -Result $Result `
        -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Write-TestResult "Get User Phones" $false
}

# ============================================================
# 12. Create User Email
# ============================================================

if ($UserID -ne "") {

    $EmailBody = @{
        user_id    = $UserID
        email      = $TestEmail
        is_primary = $true
    } | ConvertTo-Json

    $Result = Invoke-Api `
        -Method "POST" `
        -Url "$BaseUrl/api/v1/users/email" `
        -Body $EmailBody

    Assert-ApiSuccess `
        -Name "Create User Email" `
        -Result $Result `
        -ExpectedStatusCodes @(201) | Out-Null
}
else {
    Write-TestResult "Create User Email" $false
}

# ============================================================
# 13. Get User Emails
# ============================================================

if ($UserID -ne "") {

    $Result = Invoke-Api `
        -Method "GET" `
        -Url "$BaseUrl/api/v1/users/$UserID/emails"

    Assert-ApiSuccess `
        -Name "Get User Emails" `
        -Result $Result `
        -ExpectedStatusCodes @(200) | Out-Null
}
else {
    Write-TestResult "Get User Emails" $false
}

# ============================================================
# Final Result
# ============================================================

Write-Host ""
Write-Host "============================================================"
Write-Host "REGRESSION TEST RESULT"
Write-Host "============================================================"

Write-Host ("Passed : " + $Passed) -ForegroundColor Green
Write-Host ("Failed : " + $Failed) -ForegroundColor Red

Write-Host "============================================================"
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "ACCOUNT BACKEND REGRESSION TEST PASSED" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "ACCOUNT BACKEND REGRESSION TEST FAILED" -ForegroundColor Red
    exit 1
}