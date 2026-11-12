# ============================================================
# Account Backend
# Add User Email Module
# ============================================================

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot

$MigrationPath = Join-Path `
    $Root `
    "migrations\005_create_user_emails.sql"

$ModelPath = Join-Path `
    $Root `
    "internal\user\email_model.go"

$RepositoryPath = Join-Path `
    $Root `
    "internal\user\email_repository.go"

$ServicePath = Join-Path `
    $Root `
    "internal\user\email_service.go"

$HandlerPath = Join-Path `
    $Root `
    "internal\user\email_handler.go"


# ============================================================
# Helper
# ============================================================

function Write-FileIfNotExists {
    param (
        [string]$Path,
        [string]$Content
    )

    $Directory = Split-Path -Parent $Path

    if (-not (Test-Path $Directory)) {
        New-Item `
            -ItemType Directory `
            -Path $Directory `
            -Force | Out-Null
    }

    if (Test-Path $Path) {

        Write-Host ""
        Write-Host "File already exists:" `
            -ForegroundColor DarkYellow

        Write-Host $Path

        return $false
    }

    [System.IO.File]::WriteAllText(
        $Path,
        $Content,
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host ""
    Write-Host "Created:" `
        -ForegroundColor Green

    Write-Host $Path

    return $true
}


# ============================================================
# Header
# ============================================================

Write-Host ""
Write-Host "=============================================" `
    -ForegroundColor Cyan

Write-Host "        ADD USER EMAIL MODULE" `
    -ForegroundColor Cyan

Write-Host "=============================================" `
    -ForegroundColor Cyan

Write-Host ""


# ============================================================
# 1. Create Migration
# ============================================================

Write-Host "[1/5] Creating user_emails migration..." `
    -ForegroundColor Yellow


$MigrationContent = @'
CREATE TABLE user_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    email VARCHAR(320) NOT NULL,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_emails_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_emails_user_id
    ON user_emails(user_id);

CREATE UNIQUE INDEX idx_user_emails_unique_email
    ON user_emails(email);

CREATE UNIQUE INDEX idx_user_emails_primary
    ON user_emails(user_id)
    WHERE is_primary = TRUE;
'@


Write-FileIfNotExists `
    -Path $MigrationPath `
    -Content $MigrationContent | Out-Null


# ============================================================
# 2. Create Model
# ============================================================

Write-Host ""
Write-Host "[2/5] Creating Email model..." `
    -ForegroundColor Yellow


$ModelContent = @'
package user

import "time"

type UserEmail struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	Email      string     `json:"email"`
	IsPrimary  bool       `json:"is_primary"`
	IsVerified bool       `json:"is_verified"`
	VerifiedAt *time.Time `json:"verified_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
'@


Write-FileIfNotExists `
    -Path $ModelPath `
    -Content $ModelContent | Out-Null


# ============================================================
# 3. Create Repository
# ============================================================

Write-Host ""
Write-Host "[3/5] Creating Email repository..." `
    -ForegroundColor Yellow


$RepositoryContent = @'
package user

import (
	"context"
	"fmt"

	"account-backend/infrastructure/postgres"
)

type EmailRepository struct {
	db *postgres.Client
}

func NewEmailRepository(
	db *postgres.Client,
) *EmailRepository {
	return &EmailRepository{
		db: db,
	}
}

func (r *EmailRepository) Create(
	ctx context.Context,
	email *UserEmail,
) (*UserEmail, error) {

	query := `
		INSERT INTO user_emails (
			user_id,
			email,
			is_primary
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			user_id,
			email,
			is_primary,
			is_verified,
			verified_at,
			created_at,
			updated_at
	`

	var result UserEmail

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		email.UserID,
		email.Email,
		email.IsPrimary,
	).Scan(
		&result.ID,
		&result.UserID,
		&result.Email,
		&result.IsPrimary,
		&result.IsVerified,
		&result.VerifiedAt,
		&result.CreatedAt,
		&result.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to create user email: %w",
			err,
		)
	}

	return &result, nil
}

func (r *EmailRepository) GetByUserID(
	ctx context.Context,
	userID string,
) ([]UserEmail, error) {

	query := `
		SELECT
			id,
			user_id,
			email,
			is_primary,
			is_verified,
			verified_at,
			created_at,
			updated_at
		FROM user_emails
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
			"failed to get user emails: %w",
			err,
		)
	}

	defer rows.Close()

	var emails []UserEmail

	for rows.Next() {

		var email UserEmail

		err := rows.Scan(
			&email.ID,
			&email.UserID,
			&email.Email,
			&email.IsPrimary,
			&email.IsVerified,
			&email.VerifiedAt,
			&email.CreatedAt,
			&email.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf(
				"failed to scan user email: %w",
				err,
			)
		}

		emails = append(
			emails,
			email,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf(
			"failed to iterate user emails: %w",
			err,
		)
	}

	return emails, nil
}
'@


Write-FileIfNotExists `
    -Path $RepositoryPath `
    -Content $RepositoryContent | Out-Null


# ============================================================
# 4. Create Service
# ============================================================

Write-Host ""
Write-Host "[4/5] Creating Email service..." `
    -ForegroundColor Yellow


$ServiceContent = @'
package user

import (
	"context"
	"fmt"
	"strings"
)

type EmailService struct {
	repository *EmailRepository
}

func NewEmailService(
	repository *EmailRepository,
) *EmailService {
	return &EmailService{
		repository: repository,
	}
}

func (s *EmailService) CreateEmail(
	ctx context.Context,
	email *UserEmail,
) (*UserEmail, error) {

	if email == nil {
		return nil, fmt.Errorf(
			"email is required",
		)
	}

	email.UserID = strings.TrimSpace(
		email.UserID,
	)

	email.Email = strings.ToLower(
		strings.TrimSpace(
			email.Email,
		),
	)

	if email.UserID == "" {
		return nil, fmt.Errorf(
			"user id is required",
		)
	}

	if email.Email == "" {
		return nil, fmt.Errorf(
			"email is required",
		)
	}

	if !strings.Contains(
		email.Email,
		"@",
	) {
		return nil, fmt.Errorf(
			"invalid email address",
		)
	}

	return s.repository.Create(
		ctx,
		email,
	)
}

func (s *EmailService) GetEmailsByUserID(
	ctx context.Context,
	userID string,
) ([]UserEmail, error) {

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


Write-FileIfNotExists `
    -Path $ServicePath `
    -Content $ServiceContent | Out-Null


# ============================================================
# 5. Create Handler
# ============================================================

Write-Host ""
Write-Host "[5/5] Creating Email handler..." `
    -ForegroundColor Yellow


$HandlerContent = @'
package user

import (
	"encoding/json"
	"net/http"
	"strings"
)

type EmailHandler struct {
	service *EmailService
}

func NewEmailHandler(
	service *EmailService,
) *EmailHandler {
	return &EmailHandler{
		service: service,
	}
}

type createEmailRequest struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	IsPrimary bool   `json:"is_primary"`
}

func (h *EmailHandler) CreateEmail(
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

	var request createEmailRequest

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

	email := &UserEmail{
		UserID:    request.UserID,
		Email:     request.Email,
		IsPrimary: request.IsPrimary,
	}

	result, err := h.service.CreateEmail(
		r.Context(),
		email,
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

func (h *EmailHandler) GetEmailsByUserID(
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
		"/emails",
	)

	userID = strings.TrimSpace(
		userID,
	)

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

	emails, err := h.service.GetEmailsByUserID(
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
		emails,
	)
}
'@


Write-FileIfNotExists `
    -Path $HandlerPath `
    -Content $HandlerContent | Out-Null


# ============================================================
# Apply Migration
# ============================================================

Write-Host ""
Write-Host "Applying database migration..." `
    -ForegroundColor Yellow

if (-not (Test-Path $MigrationPath)) {
    throw "Migration file was not found."
}

Get-Content $MigrationPath |
    docker exec -i account-postgres psql -U account -d account

if ($LASTEXITCODE -ne 0) {
    throw "Database migration failed."
}

Write-Host ""
Write-Host "Migration applied successfully." `
    -ForegroundColor Green


# ============================================================
# Go Format
# ============================================================

Write-Host ""
Write-Host "Running go fmt..." `
    -ForegroundColor Yellow

Push-Location $Root

try {

    go fmt ./...

    if ($LASTEXITCODE -ne 0) {
        throw "go fmt failed."
    }

    Write-Host "go fmt: OK" `
        -ForegroundColor Green


    # ========================================================
    # Go Test
    # ========================================================

    Write-Host ""
    Write-Host "Running go test..." `
        -ForegroundColor Yellow

    go test ./...

    if ($LASTEXITCODE -ne 0) {
        throw "go test failed."
    }

    Write-Host "go test: OK" `
        -ForegroundColor Green

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

Write-Host "      USER EMAIL MODULE CREATED" `
    -ForegroundColor Green

Write-Host "=============================================" `
    -ForegroundColor Green

Write-Host ""

Write-Host "Created components:" `
    -ForegroundColor Cyan

Write-Host "  migrations/005_create_user_emails.sql"
Write-Host "  internal/user/email_model.go"
Write-Host "  internal/user/email_repository.go"
Write-Host "  internal/user/email_service.go"
Write-Host "  internal/user/email_handler.go"

Write-Host ""

Write-Host "Database table:" `
    -ForegroundColor Cyan

Write-Host "  user_emails"

Write-Host ""

Write-Host "Important:" `
    -ForegroundColor Yellow

Write-Host "  main.go has NOT been modified automatically."

Write-Host ""
Write-Host "User Email module created successfully." `
    -ForegroundColor Green

Write-Host ""