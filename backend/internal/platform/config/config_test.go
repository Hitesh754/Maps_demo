package config

import (
	"os"
	"testing"
)

func TestConfigValidation(t *testing.T) {
	// Base valid configuration
	setEnv := func() {
		os.Setenv("API_PORT", "8080")
		os.Setenv("ENV", "development")
		os.Setenv("LOG_LEVEL", "info")
		os.Setenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/meridian?sslmode=disable")
		os.Setenv("NATS_URL", "nats://localhost:4222")
		os.Setenv("S3_ENDPOINT", "http://localhost:9000")
		os.Setenv("S3_ACCESS_KEY", "minioadmin")
		os.Setenv("S3_SECRET_KEY", "minioadmin")
		os.Setenv("S3_BUCKET", "meridian-media")
	}

	t.Run("valid configuration passes", func(t *testing.T) {
		setEnv()
		cfg, err := Load()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if cfg.APIPort != 8080 {
			t.Errorf("expected port 8080, got %d", cfg.APIPort)
		}
	})

	t.Run("missing database url fails", func(t *testing.T) {
		setEnv()
		os.Unsetenv("DATABASE_URL")
		_, err := Load()
		if err == nil {
			t.Fatal("expected error for missing DATABASE_URL, got nil")
		}
	})

	t.Run("invalid port fails", func(t *testing.T) {
		setEnv()
		os.Setenv("API_PORT", "999999")
		_, err := Load()
		if err == nil {
			t.Fatal("expected error for out of range port, got nil")
		}
	})

	t.Run("invalid env fails", func(t *testing.T) {
		setEnv()
		os.Setenv("ENV", "invalid-env")
		_, err := Load()
		if err == nil {
			t.Fatal("expected error for invalid ENV, got nil")
		}
	})
}
