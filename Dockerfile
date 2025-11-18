# Use official Node.js runtime
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install curl for health check (TRƯỚC KHI TẠO USER)
RUN apk add --no-cache curl openssl wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set environment variables (chỉ non-sensitive configs)
ENV NODE_ENV=production
ENV PORT=8080

# Non-sensitive configuration
ENV ACCESS_TOKEN_EXPIRES_IN=30m
ENV REFRESH_TOKEN_EXPIRES_IN=1d
ENV OTP_EXPIRES_IN=5m

# Default user credentials (non-sensitive)
ENV GENERAL_NAME="duyhandsome"

# Email configuration (non-sensitive)
ENV SUPERADMIN_EMAIL="superadmin@flowpilot.io.vn"
ENV ADMIN_EMAIL="admin@acme.com"
ENV MANAGER_EMAIL="hoangduy.study@gmail.com"
ENV EMPLOYEE_EMAIL="duyhtse182314@fpt.edu.vn"

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies first (for build)
RUN npm ci --include=dev

# Install NestJS CLI globally
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Create a .env file if it doesn't exist
RUN touch .env

# Set Prisma environment variables for better reliability
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x"

# Create Prisma cache directory
RUN mkdir -p /tmp/prisma-engines && chown -R nestjs:nodejs /tmp/prisma-engines

# Set Prisma cache environment
ENV PRISMA_CLI_CACHE_DIR=/tmp/prisma-engines

# Generate Prisma client with multiple fallback strategies
RUN set -e; \
    echo "Attempting Prisma generate with default settings..."; \
    if npx prisma generate --schema=./prisma/schema.prisma; then \
        echo "Prisma generate succeeded on first attempt"; \
    else \
        echo "First attempt failed, trying with different flags..."; \
        PRISMA_GENERATE_SKIP_DOWNLOAD=true npx prisma generate --schema=./prisma/schema.prisma || \
        echo "Skipping Prisma generate due to network issues - will generate at runtime"; \
    fi

# Build the application
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start the application with runtime Prisma generation as fallback
CMD npx prisma generate --schema=./prisma/schema.prisma && node dist/src/main.js