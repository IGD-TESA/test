package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Client struct {
	Pool *pgxpool.Pool
}

func NewClient(pool *pgxpool.Pool) *Client {
	return &Client{
		Pool: pool,
	}
}

func (c *Client) Ping(ctx context.Context) error {
	return c.Pool.Ping(ctx)
}

func (c *Client) Close() {
	if c == nil || c.Pool == nil {
		return
	}

	c.Pool.Close()
}
