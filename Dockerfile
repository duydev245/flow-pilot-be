# Use official Node.js runtime
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install curl for health check (TRƯỚC KHI TẠO USER)
RUN apk add --no-cache curl

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

# Sensitive data - để trống, sẽ được set khi run container
ENV DATABASE_URL=""
ENV ACCESS_TOKEN_SECRET=""
ENV REFRESH_TOKEN_SECRET=""
ENV SECRET_API_KEY=""
ENV GENERAL_PASSWORD=""
ENV RESEND_API_KEY=""
ENV GPT_API_KEY=""
ENV OPENAI_MODEL=""

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies first (for build)
RUN npm ci --include=dev

# Install NestJS CLI globally (đảm bảo có nest command)
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Create a .env file if it doesn't exist (SAU KHI COPY)
RUN touch .env

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Generate Prisma client again for production
RUN npx prisma generate

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Start the application
CMD ["node", "dist/src/main.js"]