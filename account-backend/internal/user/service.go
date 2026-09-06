package user

import (
	"context"
	"fmt"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) CreateUser(
	ctx context.Context,
	userType string,
) (*User, error) {

	if userType != "individual" && userType != "legal" {
		return nil, fmt.Errorf(
			"user_type must be individual or legal",
		)
	}

	user, err := s.repository.Create(
		ctx,
		userType,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) GetUserByID(
	ctx context.Context,
	id string,
) (*User, error) {

	if id == "" {
		return nil, fmt.Errorf("user id is required")
	}

	user, err := s.repository.GetByID(
		ctx,
		id,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}
