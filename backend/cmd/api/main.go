package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"meridian/backend/internal/platform/config"
	"meridian/backend/internal/platform/database"
	"meridian/backend/internal/platform/events"
	"meridian/backend/internal/platform/health"
	"meridian/backend/internal/platform/httputil"
	"meridian/backend/internal/platform/storage"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "meridian-api fatal error: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	// 1. Load typed configuration
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("configuration error: %w", err)
	}

	// 2. Build structured slog JSON logger
	var slogLevel slog.Level
	switch cfg.LogLevel {
	case "debug":
		slogLevel = slog.LevelDebug
	case "warn":
		slogLevel = slog.LevelWarn
	case "error":
		slogLevel = slog.LevelError
	default:
		slogLevel = slog.LevelInfo
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slogLevel,
	}))
	slog.SetDefault(logger)

	logger.Info("starting meridian api service",
		slog.Int("port", cfg.APIPort),
		slog.String("env", cfg.Env),
		slog.String("log_level", cfg.LogLevel),
	)

	// 3. Connect to Database Pool
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	dbPool, err := database.NewPool(ctx, cfg.DatabaseURL, cfg.DatabaseMaxConns, cfg.DatabaseMinConns)
	if err != nil {
		logger.Warn("database connection not immediately available (will be retried by readiness probe)", slog.String("error", err.Error()))
	} else {
		defer dbPool.Close()
		logger.Info("connected to postgis database successfully")
	}

	// 4. Connect to NATS JetStream
	natsClient, err := events.NewNATSClient(cfg.NATSURL)
	if err != nil {
		logger.Warn("nats connection not immediately available (will be retried by readiness probe)", slog.String("error", err.Error()))
	} else {
		defer natsClient.Close()
		logger.Info("connected to nats jetstream successfully")
	}

	// 5. Connect to S3 Storage
	s3Client, err := storage.NewS3Client(ctx, cfg.S3Endpoint, cfg.S3Region, cfg.S3AccessKey, cfg.S3SecretKey, cfg.S3Bucket, cfg.S3ForcePathStyle)
	if err != nil {
		logger.Warn("s3 client initialization warning", slog.String("error", err.Error()))
	} else {
		logger.Info("initialized s3 storage client", slog.String("bucket", cfg.S3Bucket))
	}

	// 6. Setup Health Checker
	healthChecker := health.NewChecker(dbPool, natsClient, s3Client)

	// 7. Configure Chi Router & Standard Middlewares
	r := chi.NewRouter()

	r.Use(httputil.RequestIDMiddleware)
	r.Use(middleware.RealIP)
	r.Use(httputil.RequestLogger(logger))
	r.Use(httputil.Recoverer(logger))
	r.Use(middleware.Heartbeat("/ping"))

	// Platform Health & Readiness Endpoints
	r.Get("/healthz", healthChecker.HealthzHandler)
	r.Get("/readyz", healthChecker.ReadyzHandler)

	// 8. Configure HTTP Server with strict timeouts
	server := &http.Server{
		Addr:              fmt.Sprintf("0.0.0.0:%d", cfg.APIPort),
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	// 9. Graceful Shutdown listener
	shutdownErr := make(chan error, 1)
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		sig := <-sigChan

		logger.Info("shutdown signal received, gracefully draining connections", slog.String("signal", sig.String()))

		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			shutdownErr <- fmt.Errorf("error during server shutdown: %w", err)
			return
		}
		shutdownErr <- nil
	}()

	logger.Info("http server listening", slog.String("addr", server.Addr))
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("http server failure: %w", err)
	}

	return <-shutdownErr
}
