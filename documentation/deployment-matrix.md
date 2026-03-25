# Deployment Matrix

## Recommended launch path

### Primary recommendation

1. app runtime: Railway
2. database: Railway Postgres
3. media storage: Cloudflare R2
4. source control / CI: GitHub Actions

Why this is the default:

1. lowest operational complexity for first launch
2. no Next.js feature mismatch risk
3. easiest path from current local development shape

### Alternative

1. app runtime: Vercel
2. database: Railway Postgres
3. media storage: Cloudflare R2

Use this when:

1. preview deployments are a priority
2. frontend deployment DX matters more than vendor count

## Environment matrix

### Local

1. `DATABASE_URL`
2. `AUTH_SECRET`
3. `STORAGE_PROVIDER=local`

### Preview / Staging

1. `DATABASE_URL`
2. `AUTH_SECRET`
3. `STORAGE_PROVIDER=s3`
4. `S3_BUCKET`
5. `S3_REGION`
6. `S3_ENDPOINT`
7. `S3_ACCESS_KEY_ID`
8. `S3_SECRET_ACCESS_KEY`
9. `S3_PUBLIC_BASE_URL`

### Production

1. `DATABASE_URL`
2. `AUTH_SECRET`
3. `NODE_ENV=production`
4. `STORAGE_PROVIDER=s3`
5. `S3_BUCKET`
6. `S3_REGION`
7. `S3_ENDPOINT`
8. `S3_ACCESS_KEY_ID`
9. `S3_SECRET_ACCESS_KEY`
10. `S3_PUBLIC_BASE_URL`
11. optional future envs for observability / rate-limit provider if moved off Postgres

## Health checks

Use:

1. `GET /api/health`
2. `GET /api/ready`

This route should answer:

1. service is alive
2. build can start and serve traffic
3. core dependencies are ready for traffic

## Release checklist

1. production env vars are present
2. `npm run ci:verify` is green
3. DB migrations/schema changes are applied
4. health endpoint is reachable after deploy
5. readiness endpoint is reachable after deploy
6. auth login works
7. object storage upload works
8. rollback plan is available before release

## TEMP / Tech Debt

1. current schema setup is not yet managed by formal migrations
2. readiness currently validates storage configuration, not a live storage round trip
3. observability and rollback automation still need a dedicated follow-up step
