# Stage 1: Build the binary using official Go Alpine image
FROM golang:1.24-alpine AS builder

WORKDIR /src

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates tzdata

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Compile statically linked binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -trimpath \
    -ldflags="-w -s" \
    -o /bin/api \
    ./cmd/api

# Stage 2: Minimal non-root runtime image
FROM alpine:3.21

# Install runtime dependencies for healthchecks
RUN apk add --no-cache ca-certificates tzdata curl

# Create non-root user
RUN addgroup -g 10001 -S meridian && \
    adduser -u 10001 -S meridian -G meridian

USER meridian:meridian

WORKDIR /app
COPY --from=builder /bin/api /app/api

EXPOSE 8080

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1:8080/healthz || exit 1

ENTRYPOINT ["/app/api"]
