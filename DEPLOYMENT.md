# Deployment Guide

This document provides comprehensive instructions for deploying the AI Investment Platform MVP to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Database Setup](#database-setup)
6. [Vercel Deployment](#vercel-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v22.0.0 or higher
- **pnpm**: v9.x (recommended) or npm
- **Git**: For version control
- **Database**: SQLite (development) or PostgreSQL (production)

### API Keys Required

| Service | Purpose | Required |
|---------|---------|----------|
| Yahoo Finance | Stock quotes, fundamentals | Optional (free tier) |
| Finnhub | Real-time quotes, news | Optional (free tier) |
| CoinGecko | Crypto prices | Optional (free tier) |
| NewsAPI | Financial news | Optional (free tier) |
| Google OAuth | Authentication | Optional |

---

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="file:./dev.db"              # SQLite (development)
# DATABASE_URL="postgresql://..."          # PostgreSQL (production)

# Authentication (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"       # Your app URL
NEXTAUTH_SECRET="your-32-character-secret" # Generate with: openssl rand -base64 32

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# API Keys (optional - app works with mock data without these)
FINNHUB_API_KEY="your-finnhub-key"
NEWSAPI_KEY="your-newsapi-key"
YAHOO_FINANCE_API_KEY=""                   # Not required for basic usage

# Rate Limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_REQUESTS_PER_MINUTE="100"

# Logging
LOG_LEVEL="info"                           # debug, info, warn, error
```

### Generating NEXTAUTH_SECRET

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Local Development

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd AI_Portfolio

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
pnpm exec prisma generate
pnpm exec prisma db push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run test suite |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm prisma studio` | Open Prisma database GUI |

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] API keys validated
- [ ] SSL/TLS certificate configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking setup (e.g., Sentry)

### Build for Production

```bash
# Install production dependencies
pnpm install --frozen-lockfile

# Generate Prisma client
pnpm exec prisma generate

# Build the application
pnpm build

# Start production server
pnpm start
```

### Production Environment Variables

```bash
# Required for production
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="secure-production-secret"
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"

# Optional but recommended
ENABLE_RATE_LIMITING="true"
LOG_LEVEL="warn"
```

---

## Database Setup

### SQLite (Development)

SQLite is used by default for local development:

```bash
# Initialize SQLite database
pnpm exec prisma db push

# Seed with sample data (if seed script exists)
pnpm exec prisma db seed
```

### PostgreSQL (Production)

For production, use PostgreSQL:

1. **Create database**:
   ```sql
   CREATE DATABASE ai_investment_platform;
   CREATE USER app_user WITH ENCRYPTED PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE ai_investment_platform TO app_user;
   ```

2. **Update DATABASE_URL**:
   ```bash
   DATABASE_URL="postgresql://app_user:your-password@localhost:5432/ai_investment_platform?sslmode=require"
   ```

3. **Run migrations**:
   ```bash
   pnpm exec prisma migrate deploy
   ```

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U app_user ai_investment_platform > backup_$(date +%Y%m%d).sql

# SQLite backup
cp prisma/dev.db prisma/backup_$(date +%Y%m%d).db
```

---

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   pnpm add -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Configure project**:
   ```bash
   vercel
   ```

4. **Set environment variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   # Add other variables as needed
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "pnpm exec prisma generate && pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Database for Vercel

Recommended options:
- **Vercel Postgres**: Native integration
- **PlanetScale**: MySQL-compatible, serverless
- **Neon**: PostgreSQL serverless
- **Supabase**: PostgreSQL with realtime

---

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
RUN pnpm exec prisma generate
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm/@prisma+client* ./node_modules/.pnpm/

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_investment
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=ai_investment
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build image
docker build -t ai-investment-platform .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## Monitoring & Logging

### Application Logging

The application uses structured logging:

```typescript
// Log levels: debug, info, warn, error
LOG_LEVEL="info"
```

### Health Check Endpoint

Access `/api/health` to verify application status:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### Error Tracking (Sentry)

Add Sentry for error tracking:

```bash
pnpm add @sentry/nextjs
```

Configure in `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

Enable Next.js analytics:

```typescript
// next.config.ts
export default {
  experimental: {
    instrumentationHook: true,
  },
};
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Symptoms**: `PrismaClientInitializationError`

**Solutions**:
- Verify `DATABASE_URL` is correct
- Ensure database server is running
- Check network connectivity and firewall rules

```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"

# Regenerate Prisma client
pnpm exec prisma generate
```

#### 2. Authentication Not Working

**Symptoms**: Login fails, session not persisted

**Solutions**:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- For OAuth, verify callback URLs in provider settings

```bash
# Debug NextAuth
DEBUG=next-auth* pnpm dev
```

#### 3. Build Fails

**Symptoms**: TypeScript or build errors

**Solutions**:
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm exec prisma generate
pnpm build
```

#### 4. API Rate Limiting

**Symptoms**: 429 Too Many Requests

**Solutions**:
- Check `X-RateLimit-Remaining` header
- Wait for `Retry-After` period
- Increase rate limits in configuration

#### 5. Memory Issues

**Symptoms**: Out of memory during build

**Solutions**:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

### Getting Help

- Check [GitHub Issues](https://github.com/your-repo/issues)
- Review [Documentation](./docs/)
- Contact: support@example.com

---

## Security Considerations

### Production Checklist

- [ ] Use HTTPS only
- [ ] Set secure cookie options
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular dependency updates
- [ ] Database connection encryption (SSL)
- [ ] Input validation on all endpoints
- [ ] CORS properly configured

### Environment Variable Security

Never commit `.env` files. Use:
- Vercel Environment Variables
- Docker secrets
- CI/CD secret management

---

## Updating the Application

### Rolling Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Run migrations
pnpm exec prisma migrate deploy

# Rebuild
pnpm build

# Restart (depends on deployment method)
pm2 restart ai-investment
# or
docker-compose up -d --build
```

### Database Migrations

```bash
# Create migration
pnpm exec prisma migrate dev --name your_migration_name

# Apply to production
pnpm exec prisma migrate deploy
```

---

## Support

For deployment assistance:
- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@example.com
