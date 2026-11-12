package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"account-backend/infrastructure/postgres"
	"github.com/jackc/pgx/v5"
)

const (
	accessTokenTTL  = 15 * time.Minute
	refreshTokenTTL = 30 * 24 * time.Hour
)

type SessionRepository struct {
	db *postgres.Client
}

type Session struct {
	ID               string
	UserID           string
	AccessTokenHash  string
	RefreshTokenHash string
	AccessExpiresAt  time.Time
	RefreshExpiresAt time.Time
	RevokedAt        *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func NewSessionRepository(
	db *postgres.Client,
) *SessionRepository {
	return &SessionRepository{
		db: db,
	}
}

func generateSessionToken(size int) (string, error) {
	buffer := make([]byte, size)

	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(buffer), nil
}

func hashSessionToken(token string) string {
	hash := sha256.Sum256([]byte(token))

	return base64.RawURLEncoding.EncodeToString(hash[:])
}

func (r *SessionRepository) Create(
	ctx context.Context,
	userID string,
) (
	string,
	string,
	time.Time,
	error,
) {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return "", "", time.Time{}, errors.New(
			"session repository is nil",
		)
	}

	accessToken, err := generateSessionToken(32)
	if err != nil {
		return "", "", time.Time{}, fmt.Errorf(
			"failed to generate access token: %w",
			err,
		)
	}

	refreshToken, err := generateSessionToken(48)
	if err != nil {
		return "", "", time.Time{}, fmt.Errorf(
			"failed to generate refresh token: %w",
			err,
		)
	}

	accessHash := hashSessionToken(accessToken)
	refreshHash := hashSessionToken(refreshToken)

	now := time.Now()
	accessExpiresAt := now.Add(accessTokenTTL)
	refreshExpiresAt := now.Add(refreshTokenTTL)

	_, err = r.db.Pool.Exec(
		ctx,
		`
		INSERT INTO auth_sessions (
			user_id,
			access_token_hash,
			refresh_token_hash,
			access_expires_at,
			refresh_expires_at,
			created_at,
			updated_at
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$6
		)
		`,
		userID,
		accessHash,
		refreshHash,
		accessExpiresAt,
		refreshExpiresAt,
		now,
	)

	if err != nil {
		return "", "", time.Time{}, fmt.Errorf(
			"failed to create auth session: %w",
			err,
		)
	}

	return accessToken,
		refreshToken,
		accessExpiresAt,
		nil
}

func (r *SessionRepository) FindByAccessToken(
	ctx context.Context,
	accessToken string,
) (*Session, error) {

	if r == nil || r.db == nil || r.db.Pool == nil {
		return nil, errors.New(
			"session repository is nil",
		)
	}

	if accessToken == "" {
		return nil, errors.New(
			"access token is empty",
		)
	}

	accessHash := hashSessionToken(accessToken)

	session := &Session{}

	err := r.db.Pool.QueryRow(
		ctx,
		`
		SELECT
			id,
			user_id,
			access_token_hash,
			refresh_token_hash,
			access_expires_at,
			refresh_expires_at,
			revoked_at,
			created_at,
			updated_at
		FROM auth_sessions
		WHERE access_token_hash = $1
		`,
		accessHash,
	).Scan(
		&session.ID,
		&session.UserID,
		&session.AccessTokenHash,
		&session.RefreshTokenHash,
		&session.AccessExpiresAt,
		&session.RefreshExpiresAt,
		&session.RevokedAt,
		&session.CreatedAt,
		&session.UpdatedAt,
	)

	if err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSessionNotFound
		}

		return nil, fmt.Errorf(
			"failed to find session by access token: %w",
			err,
		)
	}

	return session, nil
}
func (r *SessionRepository) FindByRefreshToken(
	ctx context.Context,
	refreshToken string,
) (*Session, error) {

	if r == nil || r.db == nil || r.db.Pool == nil {
		return nil, errors.New(
			"session repository is nil",
		)
	}

	if refreshToken == "" {
		return nil, errors.New(
			"refresh token is empty",
		)
	}

	refreshHash := hashSessionToken(refreshToken)

	session := &Session{}

	err := r.db.Pool.QueryRow(
		ctx,
		`
		SELECT
			id,
			user_id,
			access_token_hash,
			refresh_token_hash,
			access_expires_at,
			refresh_expires_at,
			revoked_at,
			created_at,
			updated_at
		FROM auth_sessions
		WHERE refresh_token_hash = $1
		`,
		refreshHash,
	).Scan(
		&session.ID,
		&session.UserID,
		&session.AccessTokenHash,
		&session.RefreshTokenHash,
		&session.AccessExpiresAt,
		&session.RefreshExpiresAt,
		&session.RevokedAt,
		&session.CreatedAt,
		&session.UpdatedAt,
	)

	if err != nil {

		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSessionNotFound
		}

		return nil, fmt.Errorf(
			"failed to find session by refresh token: %w",
			err,
		)
	}

	return session, nil
}
func (r *SessionRepository) Revoke(
	ctx context.Context,
	sessionID string,
) error {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return errors.New(
			"session repository is nil",
		)
	}

	if sessionID == "" {
		return errors.New(
			"session id is empty",
		)
	}

	now := time.Now()

	commandTag, err := r.db.Pool.Exec(
		ctx,
		`
		UPDATE auth_sessions
		SET
			revoked_at = COALESCE(revoked_at, $2),
			updated_at = $2
		WHERE id = $1
		`,
		sessionID,
		now,
	)

	if err != nil {
		return fmt.Errorf(
			"failed to revoke auth session: %w",
			err,
		)
	}

	if commandTag.RowsAffected() == 0 {
		return errors.New(
			"auth session not found",
		)
	}

	return nil
}

func (r *SessionRepository) RevokeAll(
	ctx context.Context,
	userID string,
) error {
	if r == nil || r.db == nil || r.db.Pool == nil {
		return errors.New(
			"session repository is nil",
		)
	}

	if userID == "" {
		return errors.New(
			"user id is empty",
		)
	}

	now := time.Now()

	_, err := r.db.Pool.Exec(
		ctx,
		`
		UPDATE auth_sessions
		SET
			revoked_at = COALESCE(revoked_at, $2),
			updated_at = $2
		WHERE user_id = $1
		  AND revoked_at IS NULL
		`,
		userID,
		now,
	)

	if err != nil {
		return fmt.Errorf(
			"failed to revoke all auth sessions: %w",
			err,
		)
	}

	return nil
}
