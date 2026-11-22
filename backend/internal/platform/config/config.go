package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	APIPort          int    `json:"api_port"`
	Env              string `json:"env"`
	LogLevel         string `json:"log_level"`
	DatabaseURL      string `json:"-"`
	DatabaseMaxConns int    `json:"database_max_conns"`
	DatabaseMinConns int    `json:"database_min_conns"`
	NATSURL          string `json:"-"`
	S3Endpoint       string `json:"s3_endpoint"`
	S3Region         string `json:"s3_region"`
	S3AccessKey      string `json:"-"`
	S3SecretKey      string `json:"-"`
	S3Bucket         string `json:"s3_bucket"`
	S3ForcePathStyle bool   `json:"s3_force_path_style"`
}

func Load() (*Config, error) {
	cfg := &Config{
		APIPort:          8080,
		Env:              "development",
		LogLevel:         "info",
		DatabaseMaxConns: 25,
		DatabaseMinConns: 5,
		S3Region:         "us-east-1",
		S3Bucket:         "meridian-media",
		S3ForcePathStyle: true,
	}

	if portStr := os.Getenv("API_PORT"); portStr != "" {
		p, err := strconv.Atoi(portStr)
		if err != nil {
			return nil, fmt.Errorf("invalid API_PORT %q: %w", portStr, err)
		}
		cfg.APIPort = p
	}

	if env := os.Getenv("ENV"); env != "" {
		cfg.Env = strings.ToLower(env)
	}

	if lvl := os.Getenv("LOG_LEVEL"); lvl != "" {
		cfg.LogLevel = strings.ToLower(lvl)
	}

	cfg.DatabaseURL = os.Getenv("DATABASE_URL")
	if maxConnsStr := os.Getenv("DATABASE_MAX_CONNS"); maxConnsStr != "" {
		mc, err := strconv.Atoi(maxConnsStr)
		if err == nil && mc > 0 {
			cfg.DatabaseMaxConns = mc
		}
	}
	if minConnsStr := os.Getenv("DATABASE_MIN_CONNS"); minConnsStr != "" {
		mc, err := strconv.Atoi(minConnsStr)
		if err == nil && mc >= 0 {
			cfg.DatabaseMinConns = mc
		}
	}

	cfg.NATSURL = os.Getenv("NATS_URL")
	cfg.S3Endpoint = os.Getenv("S3_ENDPOINT")
	if r := os.Getenv("S3_REGION"); r != "" {
		cfg.S3Region = r
	}
	cfg.S3AccessKey = os.Getenv("S3_ACCESS_KEY")
	cfg.S3SecretKey = os.Getenv("S3_SECRET_KEY")
	if b := os.Getenv("S3_BUCKET"); b != "" {
		cfg.S3Bucket = b
	}
	if fps := os.Getenv("S3_FORCE_PATH_STYLE"); fps != "" {
		cfg.S3ForcePathStyle = strings.ToLower(fps) == "true" || fps == "1"
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.APIPort < 1 || c.APIPort > 65535 {
		return fmt.Errorf("API_PORT must be between 1 and 65535, got %d", c.APIPort)
	}

	validEnvs := map[string]bool{"development": true, "test": true, "staging": true, "production": true}
	if !validEnvs[c.Env] {
		return fmt.Errorf("ENV must be one of [development, test, staging, production], got %q", c.Env)
	}

	validLogLevels := map[string]bool{"debug": true, "info": true, "warn": true, "error": true}
	if !validLogLevels[c.LogLevel] {
		return fmt.Errorf("LOG_LEVEL must be one of [debug, info, warn, error], got %q", c.LogLevel)
	}

	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if _, err := url.Parse(c.DatabaseURL); err != nil {
		return fmt.Errorf("invalid DATABASE_URL format")
	}

	if c.NATSURL == "" {
		return fmt.Errorf("NATS_URL is required")
	}

	if c.S3Endpoint == "" {
		return fmt.Errorf("S3_ENDPOINT is required")
	}

	if c.S3AccessKey == "" {
		return fmt.Errorf("S3_ACCESS_KEY is required")
	}

	if c.S3SecretKey == "" {
		return fmt.Errorf("S3_SECRET_KEY is required")
	}

	if c.S3Bucket == "" {
		return fmt.Errorf("S3_BUCKET is required")
	}

	return nil
}
