# Docker Setup for Flow Pilot Backend

## Files Created

1. **Dockerfile** - Multi-stage build for production-optimized container
2. **.dockerignore** - Excludes unnecessary files from Docker context
3. **docker-compose.yml** - Complete development and production setup
4. **healthcheck.js** - Health check script for container monitoring
5. **.env.docker** - Sample environment variables for Docker

## Quick Start

### Production Deployment

```bash
# 1. Copy and configure environment variables
cp .env.docker .env
# Edit .env with your actual values

# 2. Build and run with docker-compose
docker-compose up -d

# 3. Run database migrations
docker-compose exec app npx prisma migrate deploy

# 4. (Optional) Seed initial data
docker-compose exec app npm run init-seed-data
```

### Development with Docker

```bash
# 1. Start development environment
docker-compose --profile dev up app-dev

# 2. The app will be available at http://localhost:3000
# 3. Code changes will auto-reload thanks to volume mounts
```

### Individual Docker Commands

```bash
# Build production image
docker build -t flow-pilot-be .

# Run production container
docker run -p 3000:3000 --env-file .env flow-pilot-be

# Build development image
docker build -t flow-pilot-be:dev --target development .

# Run with database
docker run -p 3000:3000 --env-file .env \
  --link postgres-db:db flow-pilot-be
```

## Container Features

- **Multi-stage build** - Optimized for production size
- **Security** - Runs as non-root user
- **Health checks** - Built-in container health monitoring
- **Prisma support** - Handles database client generation
- **Development mode** - Hot reload support for development

## Environment Variables

Key variables to configure in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `AWS_*` - S3 configuration for file uploads
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

```bash
# View logs
docker-compose logs app

# Shell into container
docker-compose exec app sh

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose build app
```

## Production Notes

- Container runs on port 3000 by default
- Uses PostgreSQL 15 and Redis 7
- Includes health check endpoint
- Optimized for minimal attack surface
- Supports horizontal scaling