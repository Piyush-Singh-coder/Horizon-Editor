# Stage 1: Build the Go binary
FROM golang:alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Copy module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server cmd/server/main.go

# Stage 2: Final lightweight image
FROM alpine:latest  

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/server .

# Expose port 5001 (or Render's dynamic PORT)
EXPOSE 5001

# Run the binary
CMD ["./server"]
