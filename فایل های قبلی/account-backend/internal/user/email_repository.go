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
