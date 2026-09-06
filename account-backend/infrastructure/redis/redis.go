package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	Client *redis.Client
}

func NewClientWrapper(client *redis.Client) *Client {
	return &Client{
		Client: client,
	}
}

func (c *Client) Ping(ctx context.Context) error {
	return c.Client.Ping(ctx).Err()
}

func (c *Client) Close() error {
	if c == nil || c.Client == nil {
		return nil
	}

	return c.Client.Close()
}
