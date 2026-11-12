package verification

import (
	"context"
	"errors"

	"account-backend/infrastructure/postgres"
)

type AuditRepository struct {
	db *postgres.Client
}

func NewAuditRepository(db *postgres.Client) *AuditRepository {
	return &AuditRepository{
		db: db,
	}
}

func (r *AuditRepository) Create(
	ctx context.Context,
	audit *VerificationAudit,
) error {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return errors.New("audit repository is nil")
	}

	if audit == nil {
		return errors.New("audit is nil")
	}

	query := `
		INSERT INTO verification_audits (
			user_id,
			verification_id,
			operation,
			verification_type,
			provider,
			status,
			idempotency_key,
			ip_address,
			user_agent,
			error_message,
			metadata
		)
		VALUES (
			$1,
			NULLIF($2, '')::uuid,
			$3,
			NULLIF($4, ''),
			NULLIF($5, ''),
			NULLIF($6, ''),
			NULLIF($7, ''),
			NULLIF($8, '')::inet,
			$9,
			NULLIF($10, ''),
			$11
		)
		RETURNING id, created_at
	`

	return r.db.Pool.QueryRow(
		ctx,
		query,
		audit.UserID,
		audit.VerificationID,
		audit.Operation,
		audit.VerificationType,
		audit.Provider,
		audit.Status,
		audit.IdempotencyKey,
		audit.IPAddress,
		audit.UserAgent,
		audit.ErrorMessage,
		audit.Metadata,
	).Scan(
		&audit.ID,
		&audit.CreatedAt,
	)
}
