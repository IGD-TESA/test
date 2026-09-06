# ============================================================
# Account Backend
# Connect User Phone Module to main.go
# ============================================================

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$MainPath = Join-Path $Root "cmd\server\main.go"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "      CONNECT USER PHONE MODULE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""


# ============================================================
# 1. Check main.go
# ============================================================

Write-Host "[1/6] Checking main.go..." -ForegroundColor Yellow

if (-not (Test-Path $MainPath)) {
    throw "cmd\server\main.go was not found."
}

Write-Host "main.go found." -ForegroundColor Green


# ============================================================
# 2. Read main.go
# ============================================================

Write-Host ""
Write-Host "[2/6] Reading main.go..." -ForegroundColor Yellow

$Content = Get-Content `
    -Path $MainPath `
    -Raw `
    -Encoding UTF8

Write-Host "main.go loaded." -ForegroundColor Green


# ============================================================
# 3. Create backup
# ============================================================

Write-Host ""
Write-Host "[3/6] Creating backup..." -ForegroundColor Yellow

$BackupPath = Join-Path `
    $Root `
    "cmd\server\main.go.before-user-phone"

if (-not (Test-Path $BackupPath)) {

    Copy-Item `
        -Path $MainPath `
        -Destination $BackupPath

    Write-Host "Backup created." -ForegroundColor Green
}
else {

    Write-Host `
        "Backup already exists. Keeping existing backup." `
        -ForegroundColor DarkYellow
}


# ============================================================
# 4. Connect User Phone Dependencies
# ============================================================

Write-Host ""
Write-Host "[4/6] Connecting User Phone dependencies..." `
    -ForegroundColor Yellow


# ------------------------------------------------------------
# Check whether dependency already exists
# ------------------------------------------------------------

if ($Content -match "phoneRepository\s*:=\s*user\.NewPhoneRepository") {

    Write-Host `
        "User Phone dependencies already exist. Skipping." `
        -ForegroundColor DarkYellow
}
else {

    # --------------------------------------------------------
    # Locate Legal Entity Module
    # --------------------------------------------------------

    $LegalEntityPattern = '(?s)(\s*legalEntityHandler\s*:=\s*user\.NewLegalEntityHandler\s*\(\s*legalEntityService,\s*\)\s*)'

    $LegalEntityMatch = [regex]::Match(
        $Content,
        $LegalEntityPattern
    )

    if (-not $LegalEntityMatch.Success) {

        throw `
            "Legal Entity module block was not found in main.go."
    }


    # --------------------------------------------------------
    # User Phone Dependency Block
    # --------------------------------------------------------

    $PhoneDependency = @'

	// =========================================================
	// User Phone Module
	// =========================================================

	phoneRepository := user.NewPhoneRepository(
		postgresClient,
	)

	phoneService := user.NewPhoneService(
		phoneRepository,
	)

	phoneHandler := user.NewPhoneHandler(
		phoneService,
	)

'@


    # --------------------------------------------------------
    # Insert after Legal Entity Handler
    # --------------------------------------------------------

    $InsertPosition =
        $LegalEntityMatch.Index +
        $LegalEntityMatch.Length

    $Content =
        $Content.Insert(
            $InsertPosition,
            $PhoneDependency
        )

    Write-Host `
        "User Phone dependencies added." `
        -ForegroundColor Green
}


# ============================================================
# 5. Connect User Phone Routes
# ============================================================

Write-Host ""
Write-Host "[5/6] Connecting User Phone routes..." `
    -ForegroundColor Yellow


# ============================================================
# Create Phone Route
# ============================================================

if ($Content -match '"/api/v1/users/phone"') {

    Write-Host `
        "Create Phone route already exists. Skipping." `
        -ForegroundColor DarkYellow
}
else {

    $CreateProfileRoutePattern = '(?s)(\s*// Create User Profile\s*mux\.HandleFunc\s*\(\s*"/api/v1/users/profile",\s*profileHandler\.CreateProfile,\s*\)\s*)'

    $CreateProfileMatch = [regex]::Match(
        $Content,
        $CreateProfileRoutePattern
    )

    if (-not $CreateProfileMatch.Success) {

        throw `
            "Create User Profile route was not found in main.go."
    }


    $CreatePhoneRoute = @'

	// Create User Phone
	mux.HandleFunc(
		"/api/v1/users/phone",
		phoneHandler.CreatePhone,
	)

'@


    $InsertPosition =
        $CreateProfileMatch.Index +
        $CreateProfileMatch.Length

    $Content =
        $Content.Insert(
            $InsertPosition,
            $CreatePhoneRoute
        )

    Write-Host `
        "Create Phone route added." `
        -ForegroundColor Green
}


# ============================================================
# Get Phones Route
# ============================================================

if ($Content -match 'path,\s*"/phones"') {

    Write-Host `
        "Get Phones route already exists. Skipping." `
        -ForegroundColor DarkYellow
}
else {

    $LegalEntityRoutePattern = '(?s)(\s*if\s+strings\.HasSuffix\s*\(\s*path,\s*"/legal-entity",\s*\)\s*\{\s*legalEntityHandler\.GetLegalEntityByUserID\s*\(\s*w,\s*r,\s*\)\s*return\s*\}\s*)'

    $LegalEntityRouteMatch = [regex]::Match(
        $Content,
        $LegalEntityRoutePattern
    )

    if (-not $LegalEntityRouteMatch.Success) {

        throw `
            "Legal Entity GET route was not found in main.go."
    }


    $GetPhonesRoute = @'

			if strings.HasSuffix(
				path,
				"/phones",
			) {
				phoneHandler.GetPhonesByUserID(
					w,
					r,
				)
				return
			}

'@


    $InsertPosition =
        $LegalEntityRouteMatch.Index +
        $LegalEntityRouteMatch.Length

    $Content =
        $Content.Insert(
            $InsertPosition,
            $GetPhonesRoute
        )

    Write-Host `
        "Get Phones route added." `
        -ForegroundColor Green
}


# ============================================================
# Write main.go
# ============================================================

Write-Host ""
Write-Host "Writing updated main.go..." -ForegroundColor Yellow

[System.IO.File]::WriteAllText(
    $MainPath,
    $Content,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host `
    "main.go updated successfully." `
    -ForegroundColor Green


# ============================================================
# Format and Test
# ============================================================

Write-Host ""
Write-Host "[6/6] Formatting and testing..." `
    -ForegroundColor Yellow

Push-Location $Root

try {

    # --------------------------------------------------------
    # Go Format
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "Running go fmt..." -ForegroundColor Yellow

    go fmt ./...

    if ($LASTEXITCODE -ne 0) {
        throw "go fmt failed."
    }

    Write-Host `
        "go fmt: OK" `
        -ForegroundColor Green


    # --------------------------------------------------------
    # Go Test
    # --------------------------------------------------------

    Write-Host ""
    Write-Host "Running go test..." -ForegroundColor Yellow

    go test ./...

    if ($LASTEXITCODE -ne 0) {
        throw "go test failed."
    }

    Write-Host `
        "go test: OK" `
        -ForegroundColor Green

}
catch {

    Write-Host ""
    Write-Host "ERROR DETECTED." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    Write-Host ""
    Write-Host "Restoring main.go from backup..." `
        -ForegroundColor Yellow

    if (Test-Path $BackupPath) {

        Copy-Item `
            -Path $BackupPath `
            -Destination $MainPath `
            -Force

        Write-Host `
            "main.go restored from backup." `
            -ForegroundColor Green
    }

    throw
}
finally {

    Pop-Location
}


# ============================================================
# Final Result
# ============================================================

Write-Host ""
Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host "    USER PHONE MODULE CONNECTED" `
    -ForegroundColor Green

Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host ""

Write-Host "Connected components:" -ForegroundColor Cyan

Write-Host "  PhoneRepository"
Write-Host "  PhoneService"
Write-Host "  PhoneHandler"

Write-Host ""

Write-Host "Connected routes:" -ForegroundColor Cyan

Write-Host "  POST /api/v1/users/phone"
Write-Host "  GET  /api/v1/users/{id}/phones"

Write-Host ""

Write-Host "Backup:" -ForegroundColor Cyan
Write-Host "  cmd\server\main.go.before-user-phone"

Write-Host ""

Write-Host `
    "User Phone module connected successfully." `
    -ForegroundColor Green

Write-Host ""