# =========================================================
# CONNECT USER EMAIL MODULE
# =========================================================

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "      CONNECT USER EMAIL MODULE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$mainFile = ".\cmd\server\main.go"
$backupFile = ".\cmd\server\main.go.email-backup"

$emailFiles = @(
    ".\internal\user\email_model.go",
    ".\internal\user\email_repository.go",
    ".\internal\user\email_service.go",
    ".\internal\user\email_handler.go"
)

# =========================================================
# [1/7] Checking main.go
# =========================================================

Write-Host "[1/7] Checking main.go..." -ForegroundColor Yellow

if (-not (Test-Path $mainFile)) {
    Write-Host "ERROR: main.go not found." -ForegroundColor Red
    exit 1
}

Write-Host "main.go found." -ForegroundColor Green
Write-Host ""

# =========================================================
# [2/7] Checking Email module files
# =========================================================

Write-Host "[2/7] Checking User Email module files..." -ForegroundColor Yellow

foreach ($file in $emailFiles) {

    if (-not (Test-Path $file)) {
        Write-Host "ERROR: Missing file: $file" -ForegroundColor Red
        exit 1
    }

    Write-Host "Found: $file" -ForegroundColor Green
}

Write-Host ""

# =========================================================
# [3/7] Reading main.go
# =========================================================

Write-Host "[3/7] Reading main.go..." -ForegroundColor Yellow

$mainContent = Get-Content $mainFile -Raw

if ([string]::IsNullOrWhiteSpace($mainContent)) {
    Write-Host "ERROR: main.go is empty." -ForegroundColor Red
    exit 1
}

Write-Host "main.go loaded." -ForegroundColor Green
Write-Host ""

# =========================================================
# [4/7] Creating backup
# =========================================================

Write-Host "[4/7] Creating backup..." -ForegroundColor Yellow

if (Test-Path $backupFile) {

    Write-Host "Backup already exists. Keeping existing backup." -ForegroundColor DarkYellow

}
else {

    Copy-Item $mainFile $backupFile

    Write-Host "Backup created:" -ForegroundColor Green
    Write-Host $backupFile
}

Write-Host ""

# =========================================================
# [5/7] Connecting User Email dependencies
# =========================================================

Write-Host "[5/7] Connecting User Email dependencies..." -ForegroundColor Yellow

if ($mainContent -match 'emailRepository\s*:=' ) {

    Write-Host "User Email dependencies already exist." -ForegroundColor DarkYellow

}
else {

    $emailDependencies = @'
	// =========================================================
	// User Email Module
	// =========================================================

	emailRepository := user.NewEmailRepository(
		postgresClient,
	)

	emailService := user.NewEmailService(
		emailRepository,
	)

	emailHandler := user.NewEmailHandler(
		emailService,
	)

'@

    # پیدا کردن خط Router بدون وابستگی به فاصله‌گذاری
    $routerPattern = '(?m)^[\t ]*// Router[\t ]*$'

    if (-not [regex]::IsMatch($mainContent, $routerPattern)) {

        Write-Host "ERROR: Router section not found in main.go." -ForegroundColor Red
        Write-Host "No changes were made." -ForegroundColor Yellow
        exit 1
    }

    $mainContent = [regex]::Replace(
        $mainContent,
        $routerPattern,
        ($emailDependencies + "`t// Router"),
        1
    )

    Write-Host "User Email dependencies added." -ForegroundColor Green
}

# =========================================================
# Create Email Route
# =========================================================

Write-Host "Connecting Create Email route..." -ForegroundColor Yellow

if ($mainContent -match '"/api/v1/users/email"') {

    Write-Host "Create Email route already exists." -ForegroundColor DarkYellow

}
else {

    $emailCreateRoute = @'
	// Create User Email
	mux.HandleFunc(
		"/api/v1/users/email",
		emailHandler.CreateEmail,
	)

'@

    # پیدا کردن route مربوط به Phone
    $phoneRoutePattern = '(?s)(\t// Create User Phone\s*mux\.HandleFunc\(\s*"/api/v1/users/phone",\s*phoneHandler\.CreatePhone,\s*\)\s*)'

    if (-not [regex]::IsMatch($mainContent, $phoneRoutePattern)) {

        Write-Host "ERROR: User Phone route not found." -ForegroundColor Red
        Write-Host "Restoring main.go..." -ForegroundColor Yellow

        Copy-Item $backupFile $mainFile -Force

        exit 1
    }

    $mainContent = [regex]::Replace(
        $mainContent,
        $phoneRoutePattern,
        '$1' + "`r`n" + $emailCreateRoute,
        1
    )

    Write-Host "Create Email route added." -ForegroundColor Green
}

# =========================================================
# Get Emails Route
# =========================================================

Write-Host "Connecting Get Emails route..." -ForegroundColor Yellow

if ($mainContent -match '"/emails"') {

    Write-Host "Get Emails route already exists." -ForegroundColor DarkYellow

}
else {

    $emailsBlock = @'

			if strings.HasSuffix(
				path,
				"/emails",
			) {
				emailHandler.GetEmailsByUserID(
					w,
					r,
				)
				return
			}
'@

    # بعد از بلاک phones قرار می‌گیرد
    $phonesBlockPattern = '(?s)(\t\t\tif strings\.HasSuffix\(\s*path,\s*"/phones",\s*\)\s*\{\s*phoneHandler\.GetPhonesByUserID\(\s*w,\s*r,\s*\)\s*return\s*\})'

    if (-not [regex]::IsMatch($mainContent, $phonesBlockPattern)) {

        Write-Host "ERROR: Phones route block not found." -ForegroundColor Red
        Write-Host "Restoring main.go..." -ForegroundColor Yellow

        Copy-Item $backupFile $mainFile -Force

        exit 1
    }

    $mainContent = [regex]::Replace(
        $mainContent,
        $phonesBlockPattern,
        '$1' + "`r`n" + $emailsBlock,
        1
    )

    Write-Host "Get Emails route added." -ForegroundColor Green
}

# =========================================================
# Writing main.go
# =========================================================

Write-Host ""
Write-Host "Writing updated main.go..." -ForegroundColor Yellow

Set-Content `
    -Path $mainFile `
    -Value $mainContent `
    -Encoding UTF8

Write-Host "main.go updated successfully." -ForegroundColor Green
Write-Host ""

# =========================================================
# [6/7] Formatting
# =========================================================

Write-Host "[6/7] Formatting and testing..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Running go fmt..." -ForegroundColor Yellow

go fmt ./...

if ($LASTEXITCODE -ne 0) {

    Write-Host "go fmt FAILED." -ForegroundColor Red

    Write-Host "Restoring main.go from backup..." -ForegroundColor Yellow

    Copy-Item $backupFile $mainFile -Force

    exit 1
}

Write-Host "go fmt: OK" -ForegroundColor Green
Write-Host ""

# =========================================================
# Testing
# =========================================================

Write-Host "Running go test..." -ForegroundColor Yellow

go test ./...

if ($LASTEXITCODE -ne 0) {

    Write-Host "go test FAILED." -ForegroundColor Red

    Write-Host "Restoring main.go from backup..." -ForegroundColor Yellow

    Copy-Item $backupFile $mainFile -Force

    Write-Host "main.go restored." -ForegroundColor Yellow

    exit 1
}

Write-Host "go test: OK" -ForegroundColor Green
Write-Host ""

# =========================================================
# [7/7] Result
# =========================================================

Write-Host "[7/7] User Email module connected." -ForegroundColor Yellow
Write-Host ""

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "     USER EMAIL MODULE CONNECTED" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Connected components:" -ForegroundColor Green
Write-Host "  EmailRepository"
Write-Host "  EmailService"
Write-Host "  EmailHandler"
Write-Host ""

Write-Host "Connected routes:" -ForegroundColor Green
Write-Host "  POST /api/v1/users/email"
Write-Host "  GET  /api/v1/users/{id}/emails"
Write-Host ""

Write-Host "Backup:" -ForegroundColor DarkGray
Write-Host "  $backupFile"
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "Restart the running Go server before testing the Email API."
Write-Host ""

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""