package region

import (
	"path/filepath"
	"testing"
)

func validTestConfig() Config {
	return Config{
		Name:                "Vadodara, Gujarat, India",
		Slug:                "vadodara",
		CountryCode:         "IN",
		Bbox:                [4]float64{73.11, 22.24, 73.28, 22.37},
		Center:              [2]float64{73.1812, 22.3072},
		DefaultZoom:         12,
		MinZoom:             0,
		MaxZoom:             15,
		MaxBoundsPadding:    0.05,
		ShowAdminBoundaries: false,
		DataSource:          "OpenStreetMap contributors (ODbL)",
	}
}

func TestConfigValidation(t *testing.T) {
	t.Run("valid configuration passes", func(t *testing.T) {
		cfg := validTestConfig()
		if err := cfg.Validate(); err != nil {
			t.Fatalf("expected valid config, got error: %v", err)
		}
	})

	t.Run("inverted longitude bbox fails", func(t *testing.T) {
		cfg := validTestConfig()
		cfg.Bbox[0] = 73.50
		cfg.Bbox[2] = 73.10
		if err := cfg.Validate(); err == nil {
			t.Fatalf("expected error for inverted longitude, got nil")
		}
	})

	t.Run("inverted latitude bbox fails", func(t *testing.T) {
		cfg := validTestConfig()
		cfg.Bbox[1] = 23.00
		cfg.Bbox[3] = 22.00
		if err := cfg.Validate(); err == nil {
			t.Fatalf("expected error for inverted latitude, got nil")
		}
	})

	t.Run("center outside bbox fails", func(t *testing.T) {
		cfg := validTestConfig()
		cfg.Center = [2]float64{74.0, 22.3}
		if err := cfg.Validate(); err == nil {
			t.Fatalf("expected error for center outside bbox, got nil")
		}
	})

	t.Run("excessive area fails sanity check", func(t *testing.T) {
		cfg := validTestConfig()
		cfg.Bbox = [4]float64{60.0, 10.0, 70.0, 20.0} // 10x10 degrees
		cfg.Center = [2]float64{65.0, 15.0}
		if err := cfg.Validate(); err == nil {
			t.Fatalf("expected error for excessive bbox area, got nil")
		}
	})

	t.Run("invalid zoom constraints fail", func(t *testing.T) {
		cfg := validTestConfig()
		cfg.DefaultZoom = 4
		cfg.MinZoom = 8
		if err := cfg.Validate(); err == nil {
			t.Fatalf("expected error for minZoom > defaultZoom, got nil")
		}
	})

	t.Run("invalid slug fails", func(t *testing.T) {
		cfg := validTestConfig()
		cfg.Slug = "Vadodara_IN!"
		if err := cfg.Validate(); err == nil {
			t.Fatalf("expected error for invalid slug characters, got nil")
		}
	})
}

func TestLoadCommittedConfig(t *testing.T) {
	// From backend/internal/platform/region, config/region.json is at ../../../../config/region.json
	path := filepath.Join("..", "..", "..", "..", "config", "region.json")
	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("failed to load committed config/region.json: %v", err)
	}

	if cfg.Slug != "vadodara" {
		t.Errorf("expected slug 'vadodara', got %q", cfg.Slug)
	}
	if cfg.CountryCode != "IN" {
		t.Errorf("expected countryCode 'IN', got %q", cfg.CountryCode)
	}
}
