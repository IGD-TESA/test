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
