package region

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
)

var slugRegex = regexp.MustCompile(`^[a-z0-9-]+$`)

// Config represents the configured geographic target region for Meridian.
type Config struct {
	Name                string     `json:"name"`
	Slug                string     `json:"slug"`
	CountryCode         string     `json:"countryCode"`
	Bbox                [4]float64 `json:"bbox"` // [west, south, east, north]
	Center              [2]float64 `json:"center"` // [lng, lat]
	DefaultZoom         float64    `json:"defaultZoom"`
	MinZoom             float64    `json:"minZoom"`
	MaxZoom             float64    `json:"maxZoom"`
	MaxBoundsPadding    float64    `json:"maxBoundsPadding"`
	ShowAdminBoundaries bool       `json:"showAdminBoundaries"`
	DataSource          string     `json:"dataSource"`
}

// Load reads and parses a Region Config JSON file from disk.
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("reading region config file: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parsing region config JSON: %w", err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("validating region config: %w", err)
	}

	return &cfg, nil
}

// Validate verifies bounding box sanity, coordinate validity, and operational invariants.
func (c *Config) Validate() error {
	if c.Name == "" {
		return fmt.Errorf("region name cannot be empty")
	}

	if !slugRegex.MatchString(c.Slug) {
		return fmt.Errorf("region slug %q must be lowercase alphanumeric and hyphens only", c.Slug)
	}

	if len(c.CountryCode) != 2 {
		return fmt.Errorf("countryCode %q must be a 2-letter ISO 3166-1 alpha-2 code", c.CountryCode)
	}

	west, south, east, north := c.Bbox[0], c.Bbox[1], c.Bbox[2], c.Bbox[3]

	if west < -180 || west > 180 || east < -180 || east > 180 {
		return fmt.Errorf("longitude coordinates must be in [-180, 180]: west=%f, east=%f", west, east)
	}

	if south < -90 || south > 90 || north < -90 || north > 90 {
		return fmt.Errorf("latitude coordinates must be in [-90, 90]: south=%f, north=%f", south, north)
	}

	if west >= east {
		return fmt.Errorf("invalid bbox: west (%f) must be strictly less than east (%f)", west, east)
	}

	if south >= north {
		return fmt.Errorf("invalid bbox: south (%f) must be strictly less than north (%f)", south, north)
	}

	// Area sanity limit: 8 GB RAM machines target metropolitan regions (< 2.0 degrees across)
	width := east - west
	height := north - south
	if width > 5.0 || height > 5.0 {
		return fmt.Errorf("bbox spans %f x %f degrees; exceeds 5.0 degree maximum for host resource safety", width, height)
	}

	lng, lat := c.Center[0], c.Center[1]
	if lng < west || lng > east || lat < south || lat > north {
		return fmt.Errorf("center [%f, %f] lies outside bounding box [%f, %f, %f, %f]", lng, lat, west, south, east, north)
	}

	if c.MinZoom < 0 || c.MaxZoom > 24 || c.MinZoom > c.DefaultZoom || c.DefaultZoom > c.MaxZoom {
		return fmt.Errorf("invalid zoom constraints: minZoom=%f, defaultZoom=%f, maxZoom=%f", c.MinZoom, c.DefaultZoom, c.MaxZoom)
	}

	if c.DataSource == "" {
		return fmt.Errorf("dataSource cannot be empty")
	}

	return nil
}
