package user

import (
	"context"
	"fmt"

	"account-backend/infrastructure/postgres"
)

type ProfileRepository struct {
	db *postgres.Client
}

func NewProfileRepository(db *postgres.Client) *ProfileRepository {
	return &ProfileRepository{
		db: db,
	}
}

func (r *ProfileRepository) Create(
	ctx context.Context,
	profile *UserProfile,
) (*UserProfile, error) {

	query := `
		INSERT INTO user_profiles (
			user_id,
			first_name,
			last_name,
			national_id,
			birth_date
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING
			user_id,
			first_name,
			last_name,
			national_id,
			birth_date,
			created_at,
			updated_at
	`

	var result UserProfile

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		profile.UserID,
		profile.FirstName,
		profile.LastName,
		profile.NationalID,
		profile.BirthDate,
	).Scan(
		&result.UserID,
		&result.FirstName,
		&result.LastName,
		&result.NationalID,
		&result.BirthDate,
		&result.CreatedAt,
		&result.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to create user profile: %w",
			err,
		)
	}

	return &result, nil
}

func (r *ProfileRepository) GetByUserID(
	ctx context.Context,
	userID string,
) (*UserProfile, error) {

	query := `
		SELECT
			user_id,
			first_name,
			last_name,
			national_id,
			birth_date,
			created_at,
			updated_at
		FROM user_profiles
		WHERE user_id = $1
	`

	var profile UserProfile

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		userID,
	).Scan(
		&profile.UserID,
		&profile.FirstName,
		&profile.LastName,
		&profile.NationalID,
		&profile.BirthDate,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to get user profile: %w",
			err,
		)
	}

	return &profile, nil
}
