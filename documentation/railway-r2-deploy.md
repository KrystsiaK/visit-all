# Railway + R2 Deployment

## Goal

Document the concrete first-launch deployment path for this project:

1. Railway for the app
2. Railway PostGIS for the database
3. Cloudflare R2 for media

## Recommended production shape

1. one Railway service for the Next.js app
2. one Railway PostGIS instance
3. one Cloudflare R2 bucket
4. GitHub Actions for CI checks before merge

## Railway setup

### 1. Create project

1. create a new Railway project
2. connect the GitHub repository
3. set the root to this app repo

### 2. Add database

1. add a PostgreSQL service in Railway
2. use a PostGIS-enabled Railway template, not plain PostgreSQL
3. copy the generated `DATABASE_URL`
4. keep managed backups enabled

### 3. App settings

Use:

1. start command:
   `npm run start`
2. build command:
   `npm run build`
3. healthcheck path:
   `/api/health`

The repo already includes [railway.json](/Users/kirylkrystsia/WebstormProjects/visit-all/railway.json) for health checks.

## Cloudflare R2 setup

### 1. Create bucket

1. create one bucket for production media
2. enable versioning or retention if available for your plan

### 2. Create API credentials

1. create an R2 API token with bucket access
2. note the access key id and secret

### 3. Public delivery

1. attach a public domain or CDN URL to the bucket
2. use that public base URL as `S3_PUBLIC_BASE_URL`

## Required Railway environment variables

### Core

1. `DATABASE_URL`
2. `AUTH_SECRET`
3. `NODE_ENV=production`

### Storage

1. `STORAGE_PROVIDER=s3`
2. `S3_BUCKET`
3. `S3_REGION=auto`
4. `S3_ENDPOINT`
5. `S3_ACCESS_KEY_ID`
6. `S3_SECRET_ACCESS_KEY`
7. `S3_PUBLIC_BASE_URL`

## Deployment flow

1. ensure `npm run ci:verify` is green locally or in CI
2. set all Railway environment variables
3. run DB migrations against the production database
4. deploy the app
5. verify `/api/health`
6. verify `/api/ready`
7. log in
8. create a pin
9. upload a photo

## Production migration command

Run:

```bash
DATABASE_URL="..." npm run db:migrate
```

Do this before or during the first production rollout, before live traffic depends on new schema.

## First-release verification

1. `GET /api/health` returns `200`
2. `GET /api/ready` returns `200`
3. demo login works
4. layer creation works
5. pin creation works
6. photo upload works and media URL is public

## Rollback

If deploy is bad:

1. redeploy previous Railway release
2. verify `/api/health`
3. verify `/api/ready`
4. verify login and one write flow
5. restore DB only if issue is data-destructive

## TEMP / Tech Debt

1. this is still a minimum viable production runbook, not a full SRE playbook
2. readiness checks storage configuration, not a live R2 write/read cycle
3. final branch protection and secret governance in GitHub still need to be enforced
