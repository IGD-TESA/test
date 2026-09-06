package user

import (
	"context"
	"fmt"
)

type LegalEntityService struct {
	repository *LegalEntityRepository
}

func NewLegalEntityService(
	repository *LegalEntityRepository,
) *LegalEntityService {
	return &LegalEntityService{
		repository: repository,
	}
}

func (s *LegalEntityService) CreateLegalEntity(
	ctx context.Context,
	entity *LegalEntity,
) (*LegalEntity, error) {

	if entity == nil {
		return nil, fmt.Errorf(
			"legal entity is required",
		)
	}

	if entity.UserID == "" {
		return nil, fmt.Errorf(
			"user id is required",
		)
	}

	if entity.LegalName == "" {
		return nil, fmt.Errorf(
			"legal name is required",
		)
	}

	if entity.NationalID == "" {
		return nil, fmt.Errorf(
			"national id is required",
		)
	}

	return s.repository.Create(
		ctx,
		entity,
	)
}

func (s *LegalEntityService) GetLegalEntityByUserID(
	ctx context.Context,
	userID string,
) (*LegalEntity, error) {

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
