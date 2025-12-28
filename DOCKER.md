# Docker Setup Guide

This guide explains how to build and run the Red Rose Symptom Checker frontend using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

## Files

- `Dockerfile` - Production-optimized multi-stage build
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Files to exclude from Docker build

## Quick Start

### Production Build

1. **Build the Docker image:**
   ```bash
   docker build -t red-rose-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
     -e NEXTAUTH_SECRET=your-secret-key \
     -e SECRET_KEY=your-secret-key \
     red-rose-frontend
   ```

   Or use environment file:
   ```bash
   docker run -p 3000:3000 --env-file .env.local red-rose-frontend
   ```

### Using Docker Compose

1. **Make sure your `.env.local` file is set up:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXTAUTH_SECRET=your-secret-key
   SECRET_KEY=your-secret-key
   ```

2. **Start the service:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop the service:**
   ```bash
   docker-compose down
   ```

### Development Build

For development with hot reload:

```bash
docker build -f Dockerfile.dev -t red-rose-frontend-dev .
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --env-file .env.local \
  red-rose-frontend-dev
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000)
- `NEXTAUTH_SECRET` - Secret key for NextAuth
- `SECRET_KEY` - Secret key for the application

## Building for Different Platforms

### Build for specific platform:

```bash
# For ARM64 (Apple Silicon, Raspberry Pi)
docker build --platform linux/arm64 -t red-rose-frontend .

# For AMD64 (Intel/AMD)
docker build --platform linux/amd64 -t red-rose-frontend .
```

## Production Deployment

### Build and tag for registry:

```bash
docker build -t your-registry/red-rose-frontend:latest .
docker push your-registry/red-rose-frontend:latest
```

### Run in production:

```bash
docker run -d \
  --name red-rose-frontend \
  -p 3000:3000 \
  --restart unless-stopped \
  --env-file .env.production \
  your-registry/red-rose-frontend:latest
```

## Troubleshooting

### Container exits immediately

Check logs:
```bash
docker logs red-rose-frontend
```

### Port already in use

Change the port mapping:
```bash
docker run -p 3001:3000 red-rose-frontend
```

### Build fails

1. Clear Docker cache:
   ```bash
   docker builder prune
   ```

2. Rebuild without cache:
   ```bash
   docker build --no-cache -t red-rose-frontend .
   ```

### Environment variables not working

Make sure to:
- Use `--env-file` flag or `-e` for each variable
- Check that `.env.local` exists and has correct values
- Verify variable names match exactly

## Notes

- The production Dockerfile uses Next.js standalone output for optimal image size
- The development Dockerfile includes all dependencies and enables hot reload
- Use `.dockerignore` to exclude unnecessary files from the build context
- For production, always use environment-specific `.env` files

