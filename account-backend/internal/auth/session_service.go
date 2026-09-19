package auth

import (
	"context"
	"errors"
	"fmt"
	"time"
)

var (
	ErrSessionNotFound   = errors.New("session not found")
	ErrSessionRevoked    = errors.New("session revoked")
	ErrSessionExpired    = errors.New("session expired")
	ErrInvalidToken      = errors.New("invalid token")
	ErrEmptyAccessToken  = errors.New("access token is empty")
	ErrEmptyRefreshToken = errors.New("refresh token is empty")
)

type SessionService struct {
	repository *SessionRepository
}

func NewSessionService(
	repository *SessionRepository,
) *SessionService {
	return &SessionService{
		repository: repository,
	}
}

type SessionValidationResult struct {
	Session *Session
	Valid   bool
}

func (s *SessionService) ValidateAccessToken(
	ctx context.Context,
	accessToken string,
) (*SessionValidationResult, error) {
	if s == nil || s.repository == nil {
		return nil, errors.New("session service is nil")
	}

	if accessToken == "" {
		return nil, ErrEmptyAccessToken
	}

	session, err := s.repository.FindByAccessToken(
		ctx,
		accessToken,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to find session by access token: %w",
			err,
		)
	}

	if session == nil {
		return nil, ErrSessionNotFound
	}

	if session.RevokedAt != nil {
		return &SessionValidationResult{
			Session: session,
			Valid:   false,
		}, ErrSessionRevoked
	}

	if !time.Now().Before(session.AccessExpiresAt) {
		return &SessionValidationResult{
			Session: session,
			Valid:   false,
		}, ErrSessionExpired
	}

	return &SessionValidationResult{
		Session: session,
		Valid:   true,
	}, nil
}

func (s *SessionService) ValidateRefreshToken(
	ctx context.Context,
	refreshToken string,
) (*Session, error) {
	if s == nil || s.repository == nil {
		return nil, errors.New("session service is nil")
	}

	if refreshToken == "" {
		return nil, ErrEmptyRefreshToken
	}

	session, err := s.repository.FindByRefreshToken(
		ctx,
		refreshToken,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to find session by refresh token: %w",
			err,
		)
	}

	if session == nil {
		return nil, ErrSessionNotFound
	}

	if session.RevokedAt != nil {
		return nil, ErrSessionRevoked
	}

	if !time.Now().Before(session.RefreshExpiresAt) {
		return nil, ErrSessionExpired
	}

	return session, nil
}

func (s *SessionService) Refresh(
	ctx context.Context,
	refreshToken string,
) (
	string,
	string,
	time.Time,
	error,
) {
	if s == nil || s.repository == nil {
		return "", "", time.Time{}, errors.New(
			"session service is nil",
		)
	}

	session, err := s.ValidateRefreshToken(
		ctx,
		refreshToken,
	)

	if err != nil {
		return "", "", time.Time{}, err
	}

	if err := s.repository.Revoke(
		ctx,
		session.ID,
	); err != nil {
		return "", "", time.Time{}, fmt.Errorf(
			"failed to revoke old session during refresh: %w",
			err,
		)
	}

	accessToken, newRefreshToken, accessExpiresAt, err :=
		s.repository.Create(
			ctx,
			session.UserID,
		)

	if err != nil {
		return "", "", time.Time{}, fmt.Errorf(
			"failed to create refreshed session: %w",
			err,
		)
	}

	return accessToken,
		newRefreshToken,
		accessExpiresAt,
		nil
}

func (s *SessionService) RevokeSession(
	ctx context.Context,
	sessionID string,
) error {
	if s == nil || s.repository == nil {
		return errors.New("session service is nil")
	}

	if sessionID == "" {
		return errors.New("session id is empty")
	}

	if err := s.repository.Revoke(
		ctx,
		sessionID,
	); err != nil {
		return fmt.Errorf(
			"failed to revoke session: %w",
			err,
		)
	}

	return nil
}

func (s *SessionService) Logout(
	ctx context.Context,
	accessToken string,
) error {
	if s == nil || s.repository == nil {
		return errors.New("session service is nil")
	}

	if accessToken == "" {
		return ErrEmptyAccessToken
	}

	session, err := s.repository.FindByAccessToken(
		ctx,
		accessToken,
	)

	if err != nil {
		return fmt.Errorf(
			"failed to find session during logout: %w",
			err,
		)
	}

	if session == nil {
		return ErrSessionNotFound
	}

	if session.RevokedAt != nil {
		return ErrSessionRevoked
	}

	if err := s.repository.Revoke(
		ctx,
		session.ID,
	); err != nil {
		return fmt.Errorf(
			"failed to logout session: %w",
			err,
		)
	}

	return nil
}

func (s *SessionService) LogoutAllDevices(
	ctx context.Context,
	userID string,
) error {
	if s == nil || s.repository == nil {
		return errors.New("session service is nil")
	}

	if userID == "" {
		return errors.New("user id is empty")
	}

	if err := s.repository.RevokeAll(
		ctx,
		userID,
	); err != nil {
		return fmt.Errorf(
			"failed to logout all devices: %w",
			err,
		)
	}

	return nil
}
