package verification

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	idempotencyTTL   = 10 * time.Minute
	rateLimitWindow  = 1 * time.Minute
	rateLimitPerUser = 10
	rateLimitPerIP   = 30
)

type IdempotencyRecord struct {
	Fingerprint  string        `json:"fingerprint"`
	Status       string        `json:"status"`
	Verification *Verification `json:"verification,omitempty"`
}

type Protection struct {
	cache *Cache
}

func NewProtection(cache *Cache) *Protection {
	return &Protection{
		cache: cache,
	}
}

func BuildRequestFingerprint(
	userID string,
	verificationType VerificationType,
	provider string,
	data map[string]string,
) (string, error) {
	payload := struct {
		UserID           string            `json:"user_id"`
		VerificationType VerificationType  `json:"verification_type"`
		Provider         string            `json:"provider"`
		Data             map[string]string `json:"data,omitempty"`
	}{
		UserID:           userID,
		VerificationType: verificationType,
		Provider:         provider,
		Data:             data,
	}

	raw, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	hash := sha256.Sum256(raw)

	return hex.EncodeToString(hash[:]), nil
}

func (p *Protection) CheckRateLimit(
	ctx context.Context,
	userID string,
	ip string,
) error {
	if p == nil || p.cache == nil {
		return errors.New(
			"verification protection is unavailable",
		)
	}

	if userID != "" {

		key := fmt.Sprintf(
			"verification:rate:user:%s",
			userID,
		)

		count, err := p.cache.IncrementWithTTL(
			ctx,
			key,
			rateLimitWindow,
		)

		if err != nil {
			return err
		}

		if count > rateLimitPerUser {
			return errors.New(
				"verification user rate limit exceeded",
			)
		}
	}

	if ip != "" {

		key := fmt.Sprintf(
			"verification:rate:ip:%s",
			ip,
		)

		count, err := p.cache.IncrementWithTTL(
			ctx,
			key,
			rateLimitWindow,
		)

		if err != nil {
			return err
		}

		if count > rateLimitPerIP {
			return errors.New(
				"verification ip rate limit exceeded",
			)
		}
	}

	return nil
}

func (p *Protection) GetIdempotency(
	ctx context.Context,
	key string,
	fingerprint string,
) (*Verification, bool, error) {
	if p == nil || p.cache == nil {
		return nil, false, errors.New(
			"verification protection is unavailable",
		)
	}

	if key == "" {
		return nil, false, nil
	}

	var record IdempotencyRecord

	err := p.cache.GetJSON(
		ctx,
		"verification:idempotency:"+key,
		&record,
	)

	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, false, nil
		}

		return nil, false, err
	}

	if record.Fingerprint != fingerprint {
		return nil, false, errors.New(
			"idempotency key conflicts with request",
		)
	}

	if record.Status == "processing" {
		return nil, false, errors.New(
			"idempotency request is already being processed",
		)
	}

	if record.Verification == nil {
		return nil, false, errors.New(
			"idempotency record is invalid",
		)
	}

	return record.Verification, true, nil
}

func (p *Protection) ReserveIdempotency(
	ctx context.Context,
	key string,
	fingerprint string,
) (bool, error) {
	if p == nil || p.cache == nil {
		return false, errors.New(
			"verification protection is unavailable",
		)
	}

	if key == "" {
		return true, nil
	}

	record := IdempotencyRecord{
		Fingerprint: fingerprint,
		Status:      "processing",
	}

	data, err := json.Marshal(record)
	if err != nil {
		return false, err
	}

	return p.cache.SetNX(
		ctx,
		"verification:idempotency:"+key,
		string(data),
		idempotencyTTL,
	)
}

func (p *Protection) StoreIdempotency(
	ctx context.Context,
	key string,
	fingerprint string,
	verification *Verification,
) error {
	if p == nil || p.cache == nil {
		return errors.New(
			"verification protection is unavailable",
		)
	}

	if key == "" {
		return nil
	}

	record := IdempotencyRecord{
		Fingerprint:  fingerprint,
		Status:       "completed",
		Verification: verification,
	}

	return p.cache.SetJSON(
		ctx,
		"verification:idempotency:"+key,
		record,
		idempotencyTTL,
	)
}
