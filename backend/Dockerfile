# Build stage
FROM golang:1.22-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
# - CGO_ENABLED=0 creates a static binary (no C library dependencies)
# - GOOS=linux ensures we build for the correct OS
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

# Run stage (Final Image)
# Using alpine for an incredibly small and secure final image (~5MB)
FROM alpine:latest  

# Install CA certificates to enable HTTPS requests (needed for Supabase/Stripe API)
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app/

# Copy the binary from the builder stage
COPY --from=builder /app/main .

# Expose port (Railway will automatically inject PORT env var, typically 8080)
EXPOSE 8080

# Run the binary
CMD ["./main"]
