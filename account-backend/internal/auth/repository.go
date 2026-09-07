package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"account-backend/infrastructure/postgres"
)

var ErrNationalIDAlreadyRegistered = errors.New(
	"national id already registered",
)

var ErrPhoneAlreadyRegistered = errors.New(
	"phone number already registered",
)

var ErrEmailAlreadyRegistered = errors.New(
	"email already registered",
)

type Repository struct {
	db *postgres.Client
}

func NewRepository(db *postgres.Client) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Register(
	ctx context.Context,
	request *RegistrationRequest,
	passwordHash string,
) (*RegistrationResponse, error) {

	if r == nil || r.db == nil || r.db.Pool == nil {
		return nil, errors.New("auth repository is nil")
	}

	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}

	defer tx.Rollback(ctx)

	var userID string
	var status string
	var createdAt time.Time

	userQuery := `
		INSERT INTO users (
			user_type
		)
		VALUES ($1)
		RETURNING
			id,
			status,
			created_at
	`

	err = tx.QueryRow(
		ctx,
		userQuery,
		request.UserType,
	).Scan(
		&userID,
		&status,
		&createdAt,
	)

	if err != nil {
		return nil, err
	}

	profileQuery := `
		INSERT INTO user_profiles (
			user_id,
			first_name,
			last_name,
			national_id,
			birth_date,
			father_name,
			address,
			postal_code
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			$5::date,
			$6,
			$7,
			$8
		)
	`

	_, err = tx.Exec(
		ctx,
		profileQuery,
		userID,
		request.FirstName,
		request.LastName,
		request.NationalID,
		request.BirthDate,
		request.FatherName,
		request.Address,
		request.PostalCode,
	)

	if err != nil {
		if strings.Contains(
			err.Error(),
			`user_profiles_national_id_key`,
		) {
			return nil, ErrNationalIDAlreadyRegistered
		}

		return nil, err
	}

	phoneQuery := `
		INSERT INTO user_phones (
			user_id,
			phone_number,
			is_primary,
			is_verified
		)
		VALUES (
			$1,
			$2,
			TRUE,
			FALSE
		)
	`

	_, err = tx.Exec(
		ctx,
		phoneQuery,
		userID,
		request.PhoneNumber,
	)

	if err != nil {
		if strings.Contains(
			err.Error(),
			`idx_user_phones_unique_number`,
		) {
			return nil, ErrPhoneAlreadyRegistered
		}

		return nil, err
	}

	if request.Email != "" {

		emailQuery := `
			INSERT INTO user_emails (
				user_id,
				email,
				is_primary,
				is_verified
			)
			VALUES (
				$1,
				$2,
				TRUE,
				FALSE
			)
		`

		_, err = tx.Exec(
			ctx,
			emailQuery,
			userID,
			request.Email,
		)

		if err != nil {
			if strings.Contains(
				err.Error(),
				`idx_user_emails_unique_email`,
			) {
				return nil, ErrEmailAlreadyRegistered
			}

			return nil, err
		}
	}

	credentialQuery := `
		INSERT INTO auth_credentials (
			user_id,
			password_hash
		)
		VALUES (
			$1,
			$2
		)
	`

	_, err = tx.Exec(
		ctx,
		credentialQuery,
		userID,
		passwordHash,
	)

	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &RegistrationResponse{
		UserID:        userID,
		UserType:      request.UserType,
		Status:        status,
		PhoneVerified: false,
		CreatedAt:     createdAt,
	}, nil
}
