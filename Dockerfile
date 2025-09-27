# Use official Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Create a .env file if it doesn't exist (TRƯỚC KHI COPY)
RUN touch .env

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Database configuration
ENV DATABASE_URL="postgresql://postgres:flowpilot123@database-1.cbimqosckvz2.ap-southeast-1.rds.amazonaws.com:5432/mydb?schema=public"

# JWT configuration
ENV ACCESS_TOKEN_SECRET="R0zt4LipgHmHaBKw"
ENV ACCESS_TOKEN_EXPIRES_IN=30m

ENV REFRESH_TOKEN_SECRET="8jibylSt53iXruuW"
ENV REFRESH_TOKEN_EXPIRES_IN=1d

# API configuration
ENV SECRET_API_KEY="hoangthanhduy"

# Default user credentials
ENV GENERAL_NAME="duyhandsome"
ENV GENERAL_PASSWORD="duyhandsome123"

# Email configuration
ENV SUPERADMIN_EMAIL="superadmin@flowpilot.io.vn"
ENV ADMIN_EMAIL="admin@acme.com"
ENV MANAGER_EMAIL="hoangduy.study@gmail.com"
ENV EMPLOYEE_EMAIL="duyhtse182314@fpt.edu.vn"

# OTP and email service configuration
ENV OTP_EXPIRES_IN=5m
ENV RESEND_API_KEY="re_4k2gLLVx_JrmfJPqujFhjac5wg9K3ZiuS"

# Install curl for health check
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies first (for build)
RUN npm ci

# Copy source code (SẼ GHI ĐÈ FILE .ENV NẾU CÓ)
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies and reinstall only production deps
RUN rm -rf node_modules && npm ci --only=production && npm cache clean --force

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