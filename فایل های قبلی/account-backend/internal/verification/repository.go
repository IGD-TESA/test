package verification

import (
	"context"
	"errors"

	"account-backend/infrastructure/postgres"

	"github.com/jackc/pgx/v5"
)

// Repository مسئول دسترسی Verification به PostgreSQL است.
type Repository struct {
	db *postgres.Client
}

// NewRepository یک Repository جدید ایجاد می‌کند.
func NewRepository(db *postgres.Client) *Repository {
	return &Repository{
		db: db,
	}
}

// Create یک رکورد جدید Verification ایجاد می‌کند.
func (r *Repository) Create(ctx context.Context, verification *Verification) error {
	if verification == nil {
		return errors.New("verification is nil")
	}

	query := `
		INSERT INTO verifications (
			user_id,
			verification_type,
			provider,
			status,
			reference_id,
			verification_level,
			verified_at,
			expires_at,
			rejection_reason
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9
		)
		RETURNING
			id,
			created_at,
			updated_at
	`

	return r.db.Pool.QueryRow(
		ctx,
		query,
		verification.UserID,
		verification.VerificationType,
		verification.Provider,
		verification.Status,
		verification.ReferenceID,
		verification.VerificationLevel,
		verification.VerifiedAt,
		verification.ExpiresAt,
		verification.RejectionReason,
	).Scan(
		&verification.ID,
		&verification.CreatedAt,
		&verification.UpdatedAt,
	)
}

// GetByID یک Verification را بر اساس شناسه آن دریافت می‌کند.
func (r *Repository) GetByID(
	ctx context.Context,
	id string,
) (*Verification, error) {
	query := `
		SELECT
			id,
			user_id,
			verification_type,
			provider,
			status,
			reference_id,
			verification_level,
			verified_at,
			expires_at,
			rejection_reason,
			created_at,
			updated_at
		FROM verifications
		WHERE id = $1
	`

	var verification Verification

	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&verification.ID,
		&verification.UserID,
		&verification.VerificationType,
		&verification.Provider,
		&verification.Status,
		&verification.ReferenceID,
		&verification.VerificationLevel,
		&verification.VerifiedAt,
		&verification.ExpiresAt,
		&verification.RejectionReason,
		&verification.CreatedAt,
		&verification.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("verification not found")
		}

		return nil, err
	}

	return &verification, nil
}

// GetLatestByUserAndType آخرین Verification مربوط به یک کاربر و نوع احراز را دریافت می‌کند.
func (r *Repository) GetLatestByUserAndType(
	ctx context.Context,
	userID string,
	verificationType VerificationType,
) (*Verification, error) {
	query := `
		SELECT
			id,
			user_id,
			verification_type,
			provider,
			status,
			reference_id,
			verification_level,
			verified_at,
			expires_at,
			rejection_reason,
			created_at,
			updated_at
		FROM verifications
		WHERE user_id = $1
		  AND verification_type = $2
		ORDER BY created_at DESC
		LIMIT 1
	`

	var verification Verification

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		userID,
		verificationType,
	).Scan(
		&verification.ID,
		&verification.UserID,
		&verification.VerificationType,
		&verification.Provider,
		&verification.Status,
		&verification.ReferenceID,
		&verification.VerificationLevel,
		&verification.VerifiedAt,
		&verification.ExpiresAt,
		&verification.RejectionReason,
		&verification.CreatedAt,
		&verification.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("verification not found")
		}

		return nil, err
	}

	return &verification, nil
}

// Update وضعیت و اطلاعات Verification را به‌روزرسانی می‌کند.
func (r *Repository) Update(
	ctx context.Context,
	verification *Verification,
) error {
	if verification == nil {
		return errors.New("verification is nil")
	}

	query := `
		UPDATE verifications
		SET
			provider = $2,
			status = $3,
			reference_id = $4,
			verification_level = $5,
			verified_at = $6,
			expires_at = $7,
			rejection_reason = $8,
			updated_at = NOW()
		WHERE id = $1
		RETURNING updated_at
	`

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		verification.ID,
		verification.Provider,
		verification.Status,
		verification.ReferenceID,
		verification.VerificationLevel,
		verification.VerifiedAt,
		verification.ExpiresAt,
		verification.RejectionReason,
	).Scan(
		&verification.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return errors.New("verification not found")
		}

		return err
	}

	return nil
}
