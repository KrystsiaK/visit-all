# Production Secrets Checklist

## Goal

Define the exact secrets and environment variables required for the recommended production path:

1. Railway app
2. Railway PostGIS
3. Cloudflare R2
4. GitHub Actions CI

## Canonical production path

The project now treats this as the primary launch target:

1. app runtime: Railway
2. database: Railway PostGIS
3. media storage: Cloudflare R2

## Railway app variables

Required:

1. `DATABASE_URL`
2. `AUTH_SECRET`
3. `NODE_ENV=production`
4. `APP_URL`
5. `NEXTAUTH_URL`
6. `AUTH_TRUST_HOST=true`
7. `RESEND_API_KEY`
8. `AUTH_EMAIL_FROM`
9. `MEDIA_UPLOADS_ENABLED=false` for an initial media-disabled launch
10. `STORAGE_PROVIDER=s3` only when media uploads are intentionally enabled
11. `S3_BUCKET`
12. `S3_REGION=auto`
13. `S3_ENDPOINT`
14. `S3_ACCESS_KEY_ID`
15. `S3_SECRET_ACCESS_KEY`
16. `S3_PUBLIC_BASE_URL`

## GitHub Actions secrets

Required for CI:

1. `DATABASE_URL`
2. `AUTH_SECRET`

Optional:

1. `SONAR_TOKEN`

## Secret generation

### AUTH_SECRET

Generate with:

```bash
openssl rand -base64 32
```

### R2 credentials

Use:

1. one dedicated R2 token for this app
2. bucket-scoped permissions where possible
3. separate production and preview credentials if preview storage is later added

## Operational rules

1. never commit real env files
2. Railway is source of truth for runtime secrets
3. GitHub Actions stores only CI-needed secrets
4. rotate secrets if exposed in logs, screenshots, or terminals

## First production secret audit

Before first launch confirm:

1. Railway app has all required variables
2. GitHub Actions has CI secrets
3. `AUTH_SECRET` is not reused from local development
4. `APP_URL` and `NEXTAUTH_URL` match the real production domain
5. `AUTH_EMAIL_FROM` is authorized in Resend
6. if media uploads stay disabled for launch, `MEDIA_UPLOADS_ENABLED=false` is explicitly set
7. if media uploads are enabled later, the R2 bucket URL resolves publicly
8. `DATABASE_URL` points to managed production PostGIS, not local docker

## TEMP / Tech Debt

1. no automated secret rotation exists yet
2. preview/staging secret separation is not enforced yet
