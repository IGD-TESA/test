package auth

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{
		repository: repository,
	}
}

func (s *Service) Register(
	ctx context.Context,
	request *RegistrationRequest,
) (*RegistrationResponse, error) {

	if s == nil || s.repository == nil {
		return nil, errors.New("auth repository is nil")
	}

	if request == nil {
		return nil, errors.New("registration request is required")
	}

	request.UserType = strings.TrimSpace(request.UserType)
	request.NationalID = strings.TrimSpace(request.NationalID)
	request.FirstName = strings.TrimSpace(request.FirstName)
	request.LastName = strings.TrimSpace(request.LastName)
	request.FatherName = strings.TrimSpace(request.FatherName)
	request.BirthDate = strings.TrimSpace(request.BirthDate)
	request.PhoneNumber = strings.TrimSpace(request.PhoneNumber)
	request.Email = strings.TrimSpace(
		strings.ToLower(request.Email),
	)
	request.Address = strings.TrimSpace(request.Address)
	request.PostalCode = strings.TrimSpace(request.PostalCode)

	if request.UserType != "individual" {
		return nil, errors.New(
			"only individual registration is supported in auth v1",
		)
	}

	if !validNationalID(request.NationalID) {
		return nil, errors.New("invalid national id")
	}

	if request.FirstName == "" {
		return nil, errors.New("first name is required")
	}

	if request.LastName == "" {
		return nil, errors.New("last name is required")
	}

	if request.FatherName == "" {
		return nil, errors.New("father name is required")
	}

	if request.BirthDate == "" {
		return nil, errors.New("birth date is required")
	}

	if !validPhone(request.PhoneNumber) {
		return nil, errors.New("invalid phone number")
	}

	if request.Address == "" {
		return nil, errors.New("address is required")
	}

	if !validPostalCode(request.PostalCode) {
		return nil, errors.New("invalid postal code")
	}

	if len(request.Password) < 8 {
		return nil, errors.New(
			"password must be at least 8 characters",
		)
	}

	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(request.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		return nil, err
	}

	return s.repository.Register(
		ctx,
		request,
		string(passwordHash),
	)
}

func validNationalID(value string) bool {

	if !regexp.MustCompile(`^[0-9]{10}$`).MatchString(value) {
		return false
	}

	allSame := true

	for i := 1; i < len(value); i++ {
		if value[i] != value[0] {
			allSame = false
			break
		}
	}

	if allSame {
		return false
	}

	sum := 0

	for i := 0; i < 9; i++ {
		sum += int(value[i]-'0') * (10 - i)
	}

	remainder := sum % 11
	check := int(value[9] - '0')

	if remainder < 2 {
		return check == remainder
	}

	return check == 11-remainder
}

func validPhone(value string) bool {
	return regexp.MustCompile(
		`^09[0-9]{9}$`,
	).MatchString(value)
}

func validPostalCode(value string) bool {
	return regexp.MustCompile(
		`^[0-9]{10}$`,
	).MatchString(value)
}
