$ErrorActionPreference = "Stop"

$serviceFile = ".\internal\verification\service.go"
$handlerFile = ".\internal\verification\handler.go"
$mainFile = ".\cmd\server\main.go"

$serviceBackup = ".\internal\verification\service.go.backup-before-execution"
$handlerBackup = ".\internal\verification\handler.go.backup-before-execution"
$mainBackup = ".\cmd\server\main.go.backup-before-execution"

Write-Host ""
Write-Host "========================================"
Write-Host "CONNECT VERIFICATION EXECUTION FLOW"
Write-Host "========================================"
Write-Host ""

# =========================================================
# 1. Check files
# =========================================================

foreach ($file in @($serviceFile, $handlerFile, $mainFile)) {

    if (-not (Test-Path $file)) {
        throw "Required file not found: $file"
    }
}

# =========================================================
# 2. Create backups
# =========================================================

Copy-Item $serviceFile $serviceBackup -Force
Copy-Item $handlerFile $handlerBackup -Force
Copy-Item $mainFile $mainBackup -Force

Write-Host "[OK] Backups created."

# =========================================================
# 3. Add ExecuteVerification to Service
# =========================================================

$serviceContent = Get-Content $serviceFile -Raw

if ($serviceContent -notmatch 'func \(s \*Service\) ExecuteVerification') {

    $executeServiceCode = @'

// ExecuteVerification یک عملیات واقعی Verification را
// از طریق ProviderManager اجرا می‌کند و نتیجه را در PostgreSQL ذخیره می‌کند.
func (s *Service) ExecuteVerification(
	ctx context.Context,
	userID string,
	verificationType VerificationType,
	providerName string,
	data map[string]string,
) (*Verification, error) {

	if s == nil {
		return nil, errors.New("verification service is nil")
	}

	if s.repository == nil {
		return nil, errors.New("verification repository is nil")
	}

	if s.providers == nil {
		return nil, errors.New("provider manager is nil")
	}

	if userID == "" {
		return nil, errors.New("user id is empty")
	}

	if verificationType == "" {
		return nil, errors.New("verification type is empty")
	}

	if providerName == "" {
		return nil, errors.New("provider name is empty")
	}

	provider, err := s.providers.Get(providerName)
	if err != nil {
		return nil, err
	}

	request := &ProviderRequest{
		UserID:           userID,
		VerificationType: verificationType,
		Data:             data,
	}

	result, err := provider.Verify(ctx, request)
	if err != nil {
		return nil, err
	}

	if result == nil {
		return nil, errors.New("provider result is nil")
	}

	verification := &Verification{
		UserID:            userID,
		VerificationType:  verificationType,
		Provider:          providerName,
		Status:            result.Status,
		ReferenceID:       result.ReferenceID,
		VerificationLevel: result.VerificationLevel,
		RejectionReason:   result.RejectionReason,
	}

	if result.Status == VerificationStatusVerified {
		now := time.Now()
		verification.VerifiedAt = &now
	}

	if err := s.repository.Create(ctx, verification); err != nil {
		return nil, err
	}

	return verification, nil
}
'@

    $serviceContent = $serviceContent.TrimEnd() + "`r`n" + $executeServiceCode

    Set-Content `
        -Path $serviceFile `
        -Value $serviceContent `
        -Encoding UTF8

    Write-Host "[OK] ExecuteVerification added to Service."
}
else {
    Write-Host "[SKIP] ExecuteVerification already exists in Service."
}

# =========================================================
# 4. Add ExecuteVerification to Handler
# =========================================================

$handlerContent = Get-Content $handlerFile -Raw

if ($handlerContent -notmatch 'func \(h \*Handler\) ExecuteVerification') {

    $executeHandlerCode = @'

// ExecuteVerification یک عملیات Verification را اجرا می‌کند.
func (h *Handler) ExecuteVerification(
	w http.ResponseWriter,
	r *http.Request,
) {
	if r.Method != http.MethodPost {
		writeJSONError(
			w,
			http.StatusMethodNotAllowed,
			"method not allowed",
		)
		return
	}

	if h == nil || h.service == nil {
		writeJSONError(
			w,
			http.StatusInternalServerError,
			"verification service is unavailable",
		)
		return
	}

	var request ExecuteVerificationRequest

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			"invalid request body",
		)
		return
	}

	verification, err := h.service.ExecuteVerification(
		r.Context(),
		request.UserID,
		request.VerificationType,
		request.Provider,
		request.Data,
	)

	if err != nil {
		writeJSONError(
			w,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	writeJSON(
		w,
		http.StatusOK,
		verification,
	)
}

// ExecuteVerificationRequest بدنه درخواست اجرای Verification است.
type ExecuteVerificationRequest struct {
	UserID           string            `json:"user_id"`
	VerificationType VerificationType `json:"verification_type"`
	Provider         string            `json:"provider"`
	Data             map[string]string `json:"data,omitempty"`
}
'@

    $handlerContent = $handlerContent.TrimEnd() + "`r`n" + $executeHandlerCode

    Set-Content `
        -Path $handlerFile `
        -Value $handlerContent `
        -Encoding UTF8

    Write-Host "[OK] ExecuteVerification added to Handler."
}
else {
    Write-Host "[SKIP] ExecuteVerification already exists in Handler."
}

# =========================================================
# 5. Add route to main.go
# =========================================================

$mainContent = Get-Content $mainFile -Raw

if ($mainContent -notmatch 'verificationHandler\.ExecuteVerification') {

    $routeCode = @'
        // Execute Verification
        mux.HandleFunc(
                "/api/v1/verifications/execute",
                verificationHandler.ExecuteVerification,
        )

'@

    $pattern = '(?m)^(\s*mux\.HandleFunc\(\s*"/api/v1/verifications"\s*,\s*verificationHandler\.CreateVerification\s*,\s*\))'

    if ($mainContent -notmatch $pattern) {

        Copy-Item $serviceBackup $serviceFile -Force
        Copy-Item $handlerBackup $handlerFile -Force
        Copy-Item $mainBackup $mainFile -Force

        throw "Verification create route not found in main.go."
    }

    $mainContent = [regex]::Replace(
        $mainContent,
        $pattern,
        '$1' + "`r`n`r`n" + $routeCode,
        1
    )

    Set-Content `
        -Path $mainFile `
        -Value $mainContent `
        -Encoding UTF8

    Write-Host "[OK] Execute Verification route added."
}
else {
    Write-Host "[SKIP] Execute Verification route already exists."
}

# =========================================================
# 6. Validate
# =========================================================

Write-Host ""
Write-Host "Validating..."

$serviceCheck = Get-Content $serviceFile -Raw
$handlerCheck = Get-Content $handlerFile -Raw
$mainCheck = Get-Content $mainFile -Raw

if ($serviceCheck -notmatch 'func \(s \*Service\) ExecuteVerification') {
    throw "Service validation failed."
}

if ($handlerCheck -notmatch 'func \(h \*Handler\) ExecuteVerification') {
    throw "Handler validation failed."
}

if ($mainCheck -notmatch 'verificationHandler\.ExecuteVerification') {
    throw "Route validation failed."
}

if ($mainCheck -notmatch '"/api/v1/verifications/execute"') {
    throw "Execute route path validation failed."
}

Write-Host "[OK] Validation passed."

# =========================================================
# 7. Format
# =========================================================

Write-Host ""
Write-Host "Running gofmt..."

gofmt -w `
    $serviceFile `
    $handlerFile `
    $mainFile

if ($LASTEXITCODE -ne 0) {

    Copy-Item $serviceBackup $serviceFile -Force
    Copy-Item $handlerBackup $handlerFile -Force
    Copy-Item $mainBackup $mainFile -Force

    throw "gofmt failed. Original files restored."
}

Write-Host "[OK] gofmt completed."

# =========================================================
# 8. Go tests
# =========================================================

Write-Host ""
Write-Host "Running Go tests..."
Write-Host ""

go test ./...

if ($LASTEXITCODE -ne 0) {

    Write-Host ""
    Write-Host "[FAILED] go test ./..." -ForegroundColor Red
    Write-Host ""

    Copy-Item $serviceBackup $serviceFile -Force
    Copy-Item $handlerBackup $handlerFile -Force
    Copy-Item $mainBackup $mainFile -Force

    Write-Host "[OK] Original files restored."

    exit $LASTEXITCODE
}

# =========================================================
# 9. Final
# =========================================================

Write-Host ""
Write-Host "========================================"
Write-Host "VERIFICATION EXECUTION CONNECTED"
Write-Host "========================================"
Write-Host ""

Write-Host "Flow:"
Write-Host "  HTTP"
Write-Host "   -> Handler"
Write-Host "   -> Service"
Write-Host "   -> ProviderManager"
Write-Host "   -> TestProvider"
Write-Host "   -> ProviderResult"
Write-Host "   -> PostgreSQL"
Write-Host ""

Write-Host "Endpoint:"
Write-Host "  POST /api/v1/verifications/execute"
Write-Host ""

Write-Host "[DONE]"