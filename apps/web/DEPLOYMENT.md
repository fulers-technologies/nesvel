# Production Deployment Guide

## Prerequisites

- Bun runtime installed
- Environment variables configured
- Docker (for containerized deployment)

## Environment Setup

1. Copy `.env.example` to `.env.production`:
```bash
cp .env.example .env.production
```

2. Fill in production values in `.env.production`

## Build & Deploy

### Option 1: Standalone Build

```bash
# Install dependencies
bun install

# Run validation checks
bun run validate

# Build for production
bun run build

# Start production server
bun run start:prod
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t nesvel-web:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -e NEXT_PUBLIC_API_URL=https://api.your-domain.com \
  nesvel-web:latest
```

### Option 3: Vercel Deployment

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel --prod
```

## Performance Optimization

### Bundle Analysis

Analyze bundle size and optimize chunks:

```bash
bun run build:analyze
```

Open `analyze/client.html` and `analyze/server.html` to view reports.

### Caching Strategy

- Static assets: Cache for 1 year (`immutable`)
- Images: CDN caching with 60s minimum TTL
- API responses: Use SWR/React Query for client-side caching

## Security Checklist

- [ ] All environment variables are set
- [ ] HTTPS is enforced
- [ ] Security headers are configured (CSP, HSTS, etc.)
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] API keys are stored securely
- [ ] Sensitive data is not exposed in client bundles

## Monitoring

### Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### Recommended Monitoring Tools

- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible, or Vercel Analytics
- **Performance**: Vercel Speed Insights, Lighthouse CI
- **Uptime**: UptimeRobot, Pingdom

## Production Checklist

- [ ] Build succeeds without errors
- [ ] Type checking passes (`bun run type-check`)
- [ ] Linting passes (`bun run lint`)
- [ ] Bundle size is optimized
- [ ] Environment variables are configured
- [ ] Security headers are in place
- [ ] HTTPS is enabled
- [ ] Monitoring and logging are set up
- [ ] Database migrations are applied
- [ ] CDN is configured for static assets
- [ ] Rate limiting is tested
- [ ] Error boundaries are in place
- [ ] SEO meta tags are configured

## Troubleshooting

### Build Issues

```bash
# Clear cache and rebuild
bun run clean
bun install
bun run build
```

### Type Errors

```bash
# Regenerate Next.js types
bun run type-check
```

### Port Already in Use

```bash
# Use a different port
PORT=3001 bun run start:prod
```
