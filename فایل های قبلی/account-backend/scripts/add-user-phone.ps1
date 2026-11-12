# ============================================================
# Account Backend
# Add User Phone Module
# ============================================================

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       ADD USER PHONE MODULE" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""


# ============================================================
# Helper
# ============================================================

function Write-File {
    param (
        [string]$Path,
        [string]$Content
    )

    $FullPath = Join-Path $Root $Path
    $Directory = Split-Path -Parent $FullPath

    New-Item `
        -ItemType Directory `
        -Force `
        -Path $Directory `
        | Out-Null

    if (Test-Path $FullPath) {
        Write-Host "SKIP: $Path already exists" -ForegroundColor DarkYellow
        return
    }

    [System.IO.File]::WriteAllText(
        $FullPath,
        $Content,
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host "CREATE: $Path" -ForegroundColor Green
}


# ============================================================
# 1. Migration
# ============================================================

Write-Host "[1/5] Creating migration..." -ForegroundColor Yellow

$Migration = @'
CREATE TABLE user_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    phone_number VARCHAR(20) NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_phones_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_phones_user_id
    ON user_phones(user_id);

CREATE UNIQUE INDEX idx_user_phones_unique_number
    ON user_phones(phone_number);

CREATE UNIQUE INDEX idx_user_phones_primary
    ON user_phones(user_id)
    WHERE is_primary = TRUE;
'@

Write-File `
    "migrations/004_create_user_phones.sql" `
    $Migration


# ============================================================
# 2. Model
# ============================================================

Write-Host ""
Write-Host "[2/5] Creating Go files..." -ForegroundColor Yellow

$Model = @'
package user

import "time"

type UserPhone struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	PhoneNumber string    `json:"phone_number"`
	IsPrimary  bool       `json:"is_primary"`
	IsVerified bool       `json:"is_verified"`
	VerifiedAt *time.Time `json:"verified_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
'@

Write-File `
    "internal/user/phone_model.go" `
    $Model


# ============================================================
# 3. Repository
# ============================================================

$Repository = @'
package user

import (
	"context"
	"fmt"

	"account-backend/infrastructure/postgres"
)

type PhoneRepository struct {
	db *postgres.Client
}

func NewPhoneRepository(
	db *postgres.Client,
) *PhoneRepository {
	return &PhoneRepository{
		db: db,
	}
}

func (r *PhoneRepository) Create(
	ctx context.Context,
	phone *UserPhone,
) (*UserPhone, error) {

	query := `
		INSERT INTO user_phones (
			user_id,
			phone_number,
			is_primary
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			user_id,
			phone_number,
			is_primary,
			is_verified,
			verified_at,
			created_at,
			updated_at
	`

	var result UserPhone

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		phone.UserID,
		phone.PhoneNumber,
		phone.IsPrimary,
	).Scan(
		&result.ID,
		&result.UserID,
		&result.PhoneNumber,
		&result.IsPrimary,
		&result.IsVerified,
		&result.VerifiedAt,
		&result.CreatedAt,
		&result.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to create user phone: %w",
			err,
		)
	}

	return &result, nil
}

func (r *PhoneRepository) GetByUserID(
	ctx context.Context,
	userID string,
) ([]UserPhone, error) {

	query := `
		SELECT
			id,
			user_id,
			phone_number,
			is_primary,
			is_verified,
			verified_at,
			created_at,
			updated_at
		FROM user_phones
		WHERE user_id = $1
		ORDER BY is_primary DESC, created_at ASC
	`

	rows, err := r.db.Pool.Query(
		ctx,
		query,
		userID,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to get user phones: %w",
			err,
		)
	}

	defer rows.Close()

	var phones []UserPhone

	for rows.Next() {

		var phone UserPhone

		err := rows.Scan(
			&phone.ID,
			&phone.UserID,
			&phone.PhoneNumber,
			&phone.IsPrimary,
			&phone.IsVerified,
			&phone.VerifiedAt,
			&phone.CreatedAt,
			&phone.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf(
				"failed to scan user phone: %w",
				err,
			)
		}

		phones = append(phones, phone)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf(
			"failed to iterate user phones: %w",
			err,
		)
	}

	return phones, nil
}
'@

Write-File `
    "internal/user/phone_repository.go" `
    $Repository


# ============================================================
# 4. Service
# ============================================================

$Service = @'
package user

import (
	"context"
	"fmt"
	"strings"
)

type PhoneService struct {
	repository *PhoneRepository
}

func NewPhoneService(
	repository *PhoneRepository,
) *PhoneService {
	return &PhoneService{
		repository: repository,
	}
}

func (s *PhoneService) CreatePhone(
	ctx context.Context,
	phone *UserPhone,
) (*UserPhone, error) {

	if phone == nil {
		return nil, fmt.Errorf(
			"phone is required",
		)
	}

	phone.UserID = strings.TrimSpace(
		phone.UserID,
	)

	phone.PhoneNumber = strings.TrimSpace(
		phone.PhoneNumber,
	)

	if phone.UserID == "" {
		return nil, fmt.Errorf(
			"user id is required",
		)
	}

	if phone.PhoneNumber == "" {
		return nil, fmt.Errorf(
			"phone number is required",
		)
	}

	return s.repository.Create(
		ctx,
		phone,
	)
}

func (s *PhoneService) GetPhonesByUserID(
	ctx context.Context,
	userID string,
) ([]UserPhone, error) {

	userID = strings.TrimSpace(userID)

	if userID == "" {
		return nil, fmt.Errorf(
			"user id is required",
		)
	}

	return s.repository.GetByUserID(
		ctx,
		userID,
	)
}
'@

Write-File `
    "internal/user/phone_service.go" `
    $Service


# ============================================================
# 5. Handler
# ============================================================

$Handler = @'
package user

import (
	"encoding/json"
	"net/http"
	"strings"
)

type PhoneHandler struct {
	service *PhoneService
}

func NewPhoneHandler(
	service *PhoneService,
) *PhoneHandler {
	return &PhoneHandler{
		service: service,
	}
}

type createPhoneRequest struct {
	UserID      string `json:"user_id"`
	PhoneNumber string `json:"phone_number"`
	IsPrimary   bool   `json:"is_primary"`
}

func (h *PhoneHandler) CreatePhone(
	w http.ResponseWriter,
	r *http.Request,
) {

	if r.Method != http.MethodPost {
		writeJSON(
			w,
			http.StatusMethodNotAllowed,
			map[string]string{
				"error": "method not allowed",
			},
		)

		return
	}

	var request createPhoneRequest

	if err := json.NewDecoder(
		r.Body,
	).Decode(&request); err != nil {

		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": "invalid request body",
			},
		)

		return
	}

	phone := &UserPhone{
		UserID:      request.UserID,
		PhoneNumber: request.PhoneNumber,
		IsPrimary:   request.IsPrimary,
	}

	result, err := h.service.CreatePhone(
		r.Context(),
		phone,
	)

	if err != nil {
		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": err.Error(),
			},
		)

		return
	}

	writeJSON(
		w,
		http.StatusCreated,
		result,
	)
}

func (h *PhoneHandler) GetPhonesByUserID(
	w http.ResponseWriter,
	r *http.Request,
) {

	if r.Method != http.MethodGet {
		writeJSON(
			w,
			http.StatusMethodNotAllowed,
			map[string]string{
				"error": "method not allowed",
			},
		)

		return
	}

	userID := strings.TrimPrefix(
		r.URL.Path,
		"/api/v1/users/",
	)

	userID = strings.TrimSuffix(
		userID,
		"/phones",
	)

	userID = strings.TrimSpace(userID)

	if userID == "" {
		writeJSON(
			w,
			http.StatusBadRequest,
			map[string]string{
				"error": "user id is required",
			},
		)

		return
	}

	phones, err := h.service.GetPhonesByUserID(
		r.Context(),
		userID,
	)

	if err != nil {
		writeJSON(
			w,
			http.StatusNotFound,
			map[string]string{
				"error": err.Error(),
			},
		)

		return
	}

	writeJSON(
		w,
		http.StatusOK,
		phones,
	)
}
'@

Write-File `
    "internal/user/phone_handler.go" `
    $Handler


# ============================================================
# 6. Apply Migration
# ============================================================

Write-Host ""
Write-Host "[3/5] Applying database migration..." -ForegroundColor Yellow

$MigrationPath = Join-Path `
    $Root `
    "migrations/004_create_user_phones.sql"

Get-Content $MigrationPath |
    docker exec -i account-postgres psql -U account -d account

if ($LASTEXITCODE -ne 0) {
    throw "Database migration failed."
}

Write-Host "Migration applied successfully." -ForegroundColor Green


# ============================================================
# 7. Check Go
# ============================================================

Write-Host ""
Write-Host "[4/5] Formatting Go code..." -ForegroundColor Yellow

Push-Location $Root

try {

    go fmt ./...

    if ($LASTEXITCODE -ne 0) {
        throw "go fmt failed."
    }

    Write-Host "go fmt completed." -ForegroundColor Green


    Write-Host ""
    Write-Host "Running tests..." -ForegroundColor Yellow

    go test ./...

    if ($LASTEXITCODE -ne 0) {
        throw "go test failed."
    }

    Write-Host "go test completed successfully." -ForegroundColor Green

}
finally {
    Pop-Location
}


# ============================================================
# 8. Final
# ============================================================

Write-Host ""
Write-Host "[5/5] Module generation completed." -ForegroundColor Yellow

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "       USER PHONE MODULE READY" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host ""
Write-Host "Created files:"
Write-Host "  migrations/004_create_user_phones.sql"
Write-Host "  internal/user/phone_model.go"
Write-Host "  internal/user/phone_repository.go"
Write-Host "  internal/user/phone_service.go"
Write-Host "  internal/user/phone_handler.go"

Write-Host ""
Write-Host "NOTE:"
Write-Host "main.go has NOT been modified automatically."
Write-Host "Route registration will be added after verification."

Write-Host ""