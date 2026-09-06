package postgres

import (
	"context"
	"fmt"
	"time"

	"account-backend/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(
	ctx context.Context,
	cfg config.PostgreSQLConfig,
) (*pgxpool.Pool, error) {

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.Username,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.Database,
		cfg.SSLMode,
	)

	poolConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to parse PostgreSQL configuration: %w", err)
	}

	poolConfig.MinConns = cfg.MinConnections
	poolConfig.MaxConns = cfg.MaxConnections

	poolConfig.MaxConnLifetime = 1 * time.Hour
	poolConfig.MaxConnIdleTime = 30 * time.Minute
	poolConfig.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create PostgreSQL pool: %w", err)
	}

	pingContext, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingContext); err != nil {
		pool.Close()

		return nil, fmt.Errorf(
			"failed to connect to PostgreSQL: %w",
			err,
		)
	}

	return pool, nil
}
