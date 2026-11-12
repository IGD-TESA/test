package user

import (
	"context"
	"fmt"
	"strings"
)

type PhoneService struct {
	repository *PhoneRepository
}

func NewPhoneService(
	repository *PhoneRepository,
) *PhoneService {
	return &PhoneService{
		repository: repository,
	}
}

func (s *PhoneService) CreatePhone(
	ctx context.Context,
	phone *UserPhone,
) (*UserPhone, error) {

	if phone == nil {
		return nil, fmt.Errorf(
			"phone is required",
		)
	}

	phone.UserID = strings.TrimSpace(
		phone.UserID,
	)

	phone.PhoneNumber = strings.TrimSpace(
		phone.PhoneNumber,
	)

	if phone.UserID == "" {
		return nil, fmt.Errorf(
			"user id is required",
		)
	}

	if phone.PhoneNumber == "" {
		return nil, fmt.Errorf(
			"phone number is required",
		)
	}

	return s.repository.Create(
		ctx,
		phone,
	)
}

func (s *PhoneService) GetPhonesByUserID(
	ctx context.Context,
	userID string,
) ([]UserPhone, error) {

	userID = strings.TrimSpace(userID)

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
