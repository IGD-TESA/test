package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Server     ServerConfig
	PostgreSQL PostgreSQLConfig
	Redis      RedisConfig
}

type ServerConfig struct {
	Host string
	Port int
}

type PostgreSQLConfig struct {
	Host           string
	Port           int
	Database       string
	Username       string
	Password       string
	SSLMode        string
	MinConnections int32
	MaxConnections int32
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	Database int
}

func Load() (Config, error) {
	serverPort, err := getEnvInt("SERVER_PORT", 8080)
	if err != nil {
		return Config{}, err
	}

	postgresPort, err := getEnvInt("POSTGRES_PORT", 5432)
	if err != nil {
		return Config{}, err
	}

	redisPort, err := getEnvInt("REDIS_PORT", 6379)
	if err != nil {
		return Config{}, err
	}

	redisDatabase, err := getEnvInt("REDIS_DATABASE", 0)
	if err != nil {
		return Config{}, err
	}

	minConnections, err := getEnvInt32("POSTGRES_MIN_CONNECTIONS", 2)
	if err != nil {
		return Config{}, err
	}

	maxConnections, err := getEnvInt32("POSTGRES_MAX_CONNECTIONS", 20)
	if err != nil {
		return Config{}, err
	}

	if minConnections < 0 {
		return Config{}, fmt.Errorf("POSTGRES_MIN_CONNECTIONS cannot be negative")
	}

	if maxConnections <= 0 {
		return Config{}, fmt.Errorf("POSTGRES_MAX_CONNECTIONS must be greater than zero")
	}

	if minConnections > maxConnections {
		return Config{}, fmt.Errorf(
			"POSTGRES_MIN_CONNECTIONS cannot be greater than POSTGRES_MAX_CONNECTIONS",
		)
	}

	return Config{
		Server: ServerConfig{
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Port: serverPort,
		},

		PostgreSQL: PostgreSQLConfig{
			Host:           getEnv("POSTGRES_HOST", "localhost"),
			Port:           postgresPort,
			Database:       getEnv("POSTGRES_DATABASE", "account"),
			Username:       getEnv("POSTGRES_USERNAME", "account"),
			Password:       os.Getenv("POSTGRES_PASSWORD"),
			SSLMode:        getEnv("POSTGRES_SSLMODE", "disable"),
			MinConnections: minConnections,
			MaxConnections: maxConnections,
		},

		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     redisPort,
			Password: os.Getenv("REDIS_PASSWORD"),
			Database: redisDatabase,
		},
	}, nil
}

func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)

	if value == "" {
		return defaultValue
	}

	return value
}

func getEnvInt(key string, defaultValue int) (int, error) {
	value := os.Getenv(key)

	if value == "" {
		return defaultValue, nil
	}

	result, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("%s must be a valid integer", key)
	}

	return result, nil
}

func getEnvInt32(key string, defaultValue int32) (int32, error) {
	value := os.Getenv(key)

	if value == "" {
		return defaultValue, nil
	}

	result, err := strconv.ParseInt(value, 10, 32)
	if err != nil {
		return 0, fmt.Errorf("%s must be a valid integer", key)
	}

	return int32(result), nil
}
