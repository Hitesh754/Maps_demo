package httputil

import (
	"context"
	"log/slog"
	"net/http"
	"runtime/debug"
	"time"

	"github.com/google/uuid"
)

type contextKey string

const RequestIDKey contextKey = "requestID"

func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := r.Header.Get("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		w.Header().Set("X-Request-ID", reqID)
		ctx := context.WithValue(r.Context(), RequestIDKey, reqID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetRequestID(ctx context.Context) string {
	if reqID, ok := ctx.Value(RequestIDKey).(string); ok {
		return reqID
	}
	return ""
}

func Recoverer(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rvr := recover(); rvr != nil {
					reqID := GetRequestID(r.Context())
					stack := string(debug.Stack())

					logger.Error("panic recovered during HTTP request",
						slog.Any("error", rvr),
						slog.String("request_id", reqID),
						slog.String("path", r.URL.Path),
						slog.String("stack", stack),
					)

					WriteProblem(w, http.StatusInternalServerError, ProblemDetails{
						Type:     "https://meridian.internal/errors/internal-error",
						Title:    "Internal Server Error",
						Status:   http.StatusInternalServerError,
						Detail:   "An unexpected internal error occurred",
						Code:     "INTERNAL_ERROR",
						Instance: r.URL.Path,
					})
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}

type statusLoggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *statusLoggingResponseWriter) WriteHeader(code int) {
	w.statusCode = code
	w.ResponseWriter.WriteHeader(code)
}

func RequestLogger(logger *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			wrapped := &statusLoggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}

			next.ServeHTTP(wrapped, r)

			duration := time.Since(start)
			reqID := GetRequestID(r.Context())

			logger.Info("http request completed",
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", wrapped.statusCode),
				slog.Duration("duration_ms", duration),
				slog.String("request_id", reqID),
				slog.String("remote_addr", r.RemoteAddr),
			)
		})
	}
}
