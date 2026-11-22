-- +goose Up
-- Meridian Spatial Infrastructure Baseline Migration
CREATE EXTENSION IF NOT EXISTS postgis;

-- +goose Down
DROP EXTENSION IF EXISTS postgis;
