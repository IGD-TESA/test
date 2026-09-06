$ErrorActionPreference = "Stop"

$file = ".\cmd\server\main.go"
$backup = ".\cmd\server\main.go.backup-before-verification"

Write-Host ""
Write-Host "========================================"
Write-Host "CONNECT VERIFICATION MODULE"
Write-Host "========================================"
Write-Host ""

# ---------------------------------------------------------
# 1. Check file
# ---------------------------------------------------------

if (-not (Test-Path $file)) {
    throw "main.go not found: $file"
}

# ---------------------------------------------------------
# 2. Read file
# ---------------------------------------------------------

$content = Get-Content $file -Raw

# ---------------------------------------------------------
# 3. Backup
# ---------------------------------------------------------

Copy-Item $file $backup -Force

Write-Host "[OK] Backup created."

# ---------------------------------------------------------
# 4. Import
# ---------------------------------------------------------

if ($content -notmatch '"account-backend/internal/verification"') {

    $pattern = '("account-backend/internal/user")'

    if ($content -notmatch $pattern) {
        throw "User import not found."
    }

    $content = [regex]::Replace(
        $content,
        $pattern,
        '$1' + "`r`n" + '        "account-backend/internal/verification"',
        1
    )

    Write-Host "[OK] Verification import added."
}
else {
    Write-Host "[SKIP] Verification import already exists."
}

# ---------------------------------------------------------
# 5. Verification initialization
# ---------------------------------------------------------

if ($content -notmatch 'verificationRepository\s*:=\s*verification\.NewRepository') {

    $pattern = '(?m)^(\s*mux\s*:=\s*http\.NewServeMux\(\))'

    if ($content -notmatch $pattern) {
        throw "mux := http.NewServeMux() not found."
    }

    $verificationBlock = @'
        // =========================================================
        // Verification Module
        // =========================================================

        verificationRepository := verification.NewRepository(
                postgresClient,
        )

        verificationProviders := verification.NewProviderManager()

        verificationCache := verification.NewCache(
                redisWrapper,
        )

        verificationService := verification.NewService(
                verificationRepository,
                verificationProviders,
                verificationCache,
        )

        verificationHandler := verification.NewHandler(
                verificationService,
        )

'@

    $content = [regex]::Replace(
        $content,
        $pattern,
        $verificationBlock + '$1',
        1
    )

    Write-Host "[OK] Verification module initialized."
}
else {
    Write-Host "[SKIP] Verification module initialization already exists."
}

# ---------------------------------------------------------
# 6. Verification routes
# ---------------------------------------------------------

if ($content -notmatch 'verificationHandler\.CreateVerification') {

    $pattern = '(?m)^(\s*mux\.HandleFunc\(\s*"/api/v1/users"\s*,\s*userHandler\.CreateUser\s*,\s*\))'

    if ($content -notmatch $pattern) {
        throw "Create User route not found."
    }

    $verificationRoutes = @'
        // Verification
        mux.HandleFunc(
                "/api/v1/verifications",
                verificationHandler.CreateVerification,
        )

        mux.HandleFunc(
                "/api/v1/verifications/",
                verificationHandler.GetVerification,
        )

'@

    $content = [regex]::Replace(
        $content,
        $pattern,
        $verificationRoutes + '$1',
        1
    )

    Write-Host "[OK] Verification routes added."
}
else {
    Write-Host "[SKIP] Verification routes already exist."
}

# ---------------------------------------------------------
# 7. Validate generated content BEFORE writing
# ---------------------------------------------------------

Write-Host ""
Write-Host "Validating generated main.go..."

$checks = @(
    '"account-backend/internal/verification"',
    'verificationRepository := verification.NewRepository',
    'verificationProviders := verification.NewProviderManager',
    'verificationCache := verification.NewCache',
    'verificationService := verification.NewService',
    'verificationHandler := verification.NewHandler',
    '"/api/v1/verifications"',
    'verificationHandler.CreateVerification',
    'verificationHandler.GetVerification'
)

foreach ($check in $checks) {

    if ($content -notmatch [regex]::Escape($check)) {
        throw "Validation failed. Missing: $check"
    }
}

Write-Host "[OK] All Verification wiring checks passed."

# ---------------------------------------------------------
# 8. Write
# ---------------------------------------------------------

Set-Content `
    -Path $file `
    -Value $content `
    -Encoding UTF8

Write-Host "[OK] main.go updated."

# ---------------------------------------------------------
# 9. Format
# ---------------------------------------------------------

gofmt -w $file

if ($LASTEXITCODE -ne 0) {
    Copy-Item $backup $file -Force
    throw "gofmt failed. Original main.go restored."
}

Write-Host "[OK] gofmt completed."

# ---------------------------------------------------------
# 10. Test
# ---------------------------------------------------------

Write-Host ""
Write-Host "Running Go tests..."
Write-Host ""

go test ./...

if ($LASTEXITCODE -ne 0) {

    Write-Host ""
    Write-Host "[FAILED] go test ./..." -ForegroundColor Red
    Write-Host ""
    Write-Host "Restoring original main.go..."

    Copy-Item $backup $file -Force

    Write-Host "[OK] Original main.go restored."

    exit $LASTEXITCODE
}

# ---------------------------------------------------------
# 11. Final
# ---------------------------------------------------------

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION MODULE CONNECTED"
Write-Host "========================================"
Write-Host ""

Write-Host "Components:"
Write-Host "  Repository      -> PostgreSQL"
Write-Host "  ProviderManager -> Provider layer"
Write-Host "  Cache           -> Redis"
Write-Host "  Service         -> Verification Service"
Write-Host "  Handler         -> HTTP Handler"

Write-Host ""
Write-Host "Routes:"
Write-Host "  POST /api/v1/verifications"
Write-Host "  GET  /api/v1/verifications/{id}"

Write-Host ""
Write-Host "Backup:"
Write-Host "  $backup"

Write-Host ""
Write-Host "[DONE]"