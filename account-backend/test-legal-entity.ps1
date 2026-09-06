# ============================================================
# Account Backend - Legal Entity Full Test
# ============================================================

$BaseUrl = "http://localhost:8080"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Legal Entity Integration Test" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""


# ============================================================
# 1. Health Check
# ============================================================

Write-Host "[1/4] Checking Account Backend..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod `
        -Uri "$BaseUrl/health" `
        -Method GET `
        -ErrorAction Stop

    Write-Host "Backend: OK" -ForegroundColor Green
}
catch {
    Write-Host "Backend is not running." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}


# ============================================================
# 2. Create Legal User
# ============================================================

Write-Host ""
Write-Host "[2/4] Creating legal user..." -ForegroundColor Yellow

$createUserBody = @{
    user_type = "legal"
} | ConvertTo-Json

try {
    $user = Invoke-RestMethod `
        -Uri "$BaseUrl/api/v1/users" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $createUserBody `
        -ErrorAction Stop

    $UserID = $user.id

    Write-Host "Legal user created successfully." -ForegroundColor Green
    Write-Host "User ID: $UserID"
}
catch {
    Write-Host "Failed to create legal user." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}


# ============================================================
# 3. Create Legal Entity
# ============================================================

Write-Host ""
Write-Host "[3/4] Creating legal entity..." -ForegroundColor Yellow

$createLegalEntityBody = @{
    user_id             = $UserID
    legal_name          = "شرکت توسعه سبز ایران"
    national_id         = "14001234567"
    registration_number = "12345"
    economic_code       = "411111111111"
    legal_type          = "company"
    registration_date   = "2020-01-01"
} | ConvertTo-Json

try {
    $legalEntity = Invoke-RestMethod `
        -Uri "$BaseUrl/api/v1/users/legal-entity" `
        -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $createLegalEntityBody `
        -ErrorAction Stop

    Write-Host "Legal entity created successfully." -ForegroundColor Green
}
catch {
    Write-Host "Failed to create legal entity." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}


# ============================================================
# 4. Get Legal Entity
# ============================================================

Write-Host ""
Write-Host "[4/4] Reading legal entity..." -ForegroundColor Yellow

try {
    $result = Invoke-RestMethod `
        -Uri "$BaseUrl/api/v1/users/$UserID/legal-entity" `
        -Method GET `
        -ErrorAction Stop

    Write-Host "Legal entity retrieved successfully." -ForegroundColor Green
}
catch {
    Write-Host "Failed to retrieve legal entity." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}


# ============================================================
# Final Result
# ============================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "             TEST RESULT" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "User ID             : $($result.user_id)"
Write-Host "Legal Name          : $($result.legal_name)"
Write-Host "National ID         : $($result.national_id)"
Write-Host "Registration Number : $($result.registration_number)"
Write-Host "Economic Code       : $($result.economic_code)"
Write-Host "Legal Type          : $($result.legal_type)"
Write-Host "Registration Date   : $($result.registration_date)"
Write-Host "Created At          : $($result.created_at)"
Write-Host "Updated At          : $($result.updated_at)"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "       LEGAL ENTITY TEST PASSED" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""