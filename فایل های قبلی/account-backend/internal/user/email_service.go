package user

import (
	"context"
	"fmt"
	"strings"
)

type EmailService struct {
	repository *EmailRepository
}

func NewEmailService(
	repository *EmailRepository,
) *EmailService {
	return &EmailService{
		repository: repository,
	}
}

func (s *EmailService) CreateEmail(
	ctx context.Context,
	email *UserEmail,
) (*UserEmail, error) {

	if email == nil {
		return nil, fmt.Errorf(
			"email is required",
		)
	}

	email.UserID = strings.TrimSpace(
		email.UserID,
	)

	email.Email = strings.ToLower(
		strings.TrimSpace(
			email.Email,
		),
	)

	if email.UserID == "" {
		return nil, fmt.Errorf(
			"user id is required",
		)
	}

	if email.Email == "" {
		return nil, fmt.Errorf(
			"email is required",
		)
	}

	if !strings.Contains(
		email.Email,
		"@",
	) {
		return nil, fmt.Errorf(
			"invalid email address",
		)
	}

	return s.repository.Create(
		ctx,
		email,
	)
}

func (s *EmailService) GetEmailsByUserID(
	ctx context.Context,
	userID string,
) ([]UserEmail, error) {

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
