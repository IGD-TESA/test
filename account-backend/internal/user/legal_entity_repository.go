package user

import (
	"context"
	"fmt"

	"account-backend/infrastructure/postgres"
)

type LegalEntityRepository struct {
	db *postgres.Client
}

func NewLegalEntityRepository(
	db *postgres.Client,
) *LegalEntityRepository {
	return &LegalEntityRepository{
		db: db,
	}
}

func (r *LegalEntityRepository) Create(
	ctx context.Context,
	entity *LegalEntity,
) (*LegalEntity, error) {

	query := `
		INSERT INTO legal_entities (
			user_id,
			legal_name,
			national_id,
			registration_number,
			economic_code,
			legal_type,
			registration_date
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7
		)
		RETURNING
			user_id,
			legal_name,
			national_id,
			registration_number,
			economic_code,
			legal_type,
			registration_date,
			created_at,
			updated_at
	`

	var result LegalEntity

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		entity.UserID,
		entity.LegalName,
		entity.NationalID,
		entity.RegistrationNumber,
		entity.EconomicCode,
		entity.LegalType,
		entity.RegistrationDate,
	).Scan(
		&result.UserID,
		&result.LegalName,
		&result.NationalID,
		&result.RegistrationNumber,
		&result.EconomicCode,
		&result.LegalType,
		&result.RegistrationDate,
		&result.CreatedAt,
		&result.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to create legal entity: %w",
			err,
		)
	}

	return &result, nil
}

func (r *LegalEntityRepository) GetByUserID(
	ctx context.Context,
	userID string,
) (*LegalEntity, error) {

	query := `
		SELECT
			user_id,
			legal_name,
			national_id,
			registration_number,
			economic_code,
			legal_type,
			registration_date,
			created_at,
			updated_at
		FROM legal_entities
		WHERE user_id = $1
	`

	var result LegalEntity

	err := r.db.Pool.QueryRow(
		ctx,
		query,
		userID,
	).Scan(
		&result.UserID,
		&result.LegalName,
		&result.NationalID,
		&result.RegistrationNumber,
		&result.EconomicCode,
		&result.LegalType,
		&result.RegistrationDate,
		&result.CreatedAt,
		&result.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to get legal entity: %w",
			err,
		)
	}

	return &result, nil
}
