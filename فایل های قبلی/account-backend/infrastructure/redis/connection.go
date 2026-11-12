package redis

import (
	"context"
	"fmt"
	"time"

	"account-backend/config"

	"github.com/redis/go-redis/v9"
)

func NewClient(
	ctx context.Context,
	cfg config.RedisConfig,
) (*redis.Client, error) {

	client := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf(
			"%s:%d",
			cfg.Host,
			cfg.Port,
		),

		Password: cfg.Password,
		DB:       cfg.Database,

		MinIdleConns: 2,
		PoolSize:     20,

		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,

		PoolTimeout: 4 * time.Second,
	})

	pingContext, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingContext).Err(); err != nil {
		_ = client.Close()

		return nil, fmt.Errorf(
			"failed to connect to Redis: %w",
			err,
		)
	}

	return client, nil
}
