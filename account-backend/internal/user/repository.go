package user

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"

	"account-backend/infrastructure/postgres"
)

type Repository struct {
	db *postgres.Client
}

func NewRepository(db *postgres.Client) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(
	ctx context.Context,
	userType string,
) (*User, error) {

	var user User

	query := `
		INSERT INTO users (
			user_type
		)
		VALUES ($1)
		RETURNING
			id,
			user_type,
			status,
			created_at,
			updated_at
	`

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		userType,
	).Scan(
		&user.ID,
		&user.UserType,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to create user: %w",
			err,
		)
	}

	return &user, nil
}

func (r *Repository) GetByID(
	ctx context.Context,
	id string,
) (*User, error) {

	var user User

	query := `
		SELECT
			id,
			user_type,
			status,
			created_at,
			updated_at
		FROM users
		WHERE id = $1
	`

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		id,
	).Scan(
		&user.ID,
		&user.UserType,
		&user.Status,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}

		return nil, fmt.Errorf(
			"failed to get user: %w",
			err,
		)
	}

	return &user, nil
}
