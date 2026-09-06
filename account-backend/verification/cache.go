package verification

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	redisinfra "account-backend/infrastructure/redis"
)

// Cache مسئول نگهداری وضعیت‌های موقت Verification در Redis است.
type Cache struct {
	redis *redisinfra.Client
}

// NewCache یک Cache جدید ایجاد می‌کند.
func NewCache(redis *redisinfra.Client) *Cache {
	return &Cache{
		redis: redis,
	}
}

// Set یک مقدار موقت را با TTL در Redis ذخیره می‌کند.
func (c *Cache) Set(
	ctx context.Context,
	key string,
	value string,
	ttl time.Duration,
) error {
	if c == nil || c.redis == nil || c.redis.Client == nil {
		return errors.New("redis client is nil")
	}

	if key == "" {
		return errors.New("cache key is empty")
	}

	if ttl <= 0 {
		return errors.New("cache ttl must be greater than zero")
	}

	return c.redis.Client.Set(ctx, key, value, ttl).Err()
}

// Get یک مقدار را از Redis دریافت می‌کند.
func (c *Cache) Get(
	ctx context.Context,
	key string,
) (string, error) {
	if c == nil || c.redis == nil || c.redis.Client == nil {
		return "", errors.New("redis client is nil")
	}

	if key == "" {
		return "", errors.New("cache key is empty")
	}

	return c.redis.Client.Get(ctx, key).Result()
}

// Delete یک مقدار را از Redis حذف می‌کند.
func (c *Cache) Delete(
	ctx context.Context,
	key string,
) error {
	if c == nil || c.redis == nil || c.redis.Client == nil {
		return errors.New("redis client is nil")
	}

	if key == "" {
		return errors.New("cache key is empty")
	}

	return c.redis.Client.Del(ctx, key).Err()
}

// SetJSON یک مقدار ساختاریافته را به صورت JSON در Redis ذخیره می‌کند.
func (c *Cache) SetJSON(
	ctx context.Context,
	key string,
	value any,
	ttl time.Duration,
) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return c.Set(ctx, key, string(data), ttl)
}

// GetJSON یک مقدار JSON را از Redis دریافت و Decode می‌کند.
func (c *Cache) GetJSON(
	ctx context.Context,
	key string,
	target any,
) error {
	data, err := c.Get(ctx, key)
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(data), target)
}
