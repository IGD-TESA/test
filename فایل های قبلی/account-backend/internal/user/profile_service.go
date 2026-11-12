package user

import (
	"context"
	"fmt"
)

type ProfileService struct {
	repository *ProfileRepository
}

func NewProfileService(
	repository *ProfileRepository,
) *ProfileService {
	return &ProfileService{
		repository: repository,
	}
}

func (s *ProfileService) CreateProfile(
	ctx context.Context,
	profile *UserProfile,
) (*UserProfile, error) {

	if profile == nil {
		return nil, fmt.Errorf("profile is required")
	}

	if profile.UserID == "" {
		return nil, fmt.Errorf("user id is required")
	}

	if profile.FirstName == "" {
		return nil, fmt.Errorf("first name is required")
	}

	if profile.LastName == "" {
		return nil, fmt.Errorf("last name is required")
	}

	if profile.NationalID == "" {
		return nil, fmt.Errorf("national id is required")
	}

	return s.repository.Create(
		ctx,
		profile,
	)
}

func (s *ProfileService) GetProfileByUserID(
	ctx context.Context,
	userID string,
) (*UserProfile, error) {

	if userID == "" {
		return nil, fmt.Errorf("user id is required")
	}

	return s.repository.GetByUserID(
		ctx,
		userID,
	)
}
