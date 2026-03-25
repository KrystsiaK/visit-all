# Operations Minimum

## Goal

Define the minimum operational baseline required for first production launch.

## Runtime signals

### Liveness

1. `GET /api/health`
2. expected result: `200`
3. purpose: app process is up and can answer requests

### Readiness

1. `GET /api/ready`
2. expected result: `200`
3. checks:
   database connectivity
   storage configuration
   auth secret presence

## Release minimum

Before deploy:

1. `npm run ci:verify` is green
2. production env vars are configured
3. Railway/Vercel health endpoint path is set
4. database schema is up to date
5. object storage config is present if `STORAGE_PROVIDER=s3`

After deploy:

1. hit `/api/health`
2. hit `/api/ready`
3. log in with demo account
4. create a pin
5. upload a photo
6. confirm widget panel opens and map shell loads

## Backup minimum

1. enable managed Postgres backups in provider settings
2. before risky schema changes, create a manual DB backup/snapshot
3. keep object storage versioning or bucket retention enabled when possible

## Rollback minimum

If a deploy is bad:

1. stop rollout
2. redeploy the previous known-good application version
3. verify `/api/health`
4. verify `/api/ready`
5. verify login and one create/edit flow
6. restore DB only if the issue is data-destructive and app rollback alone is insufficient

## Recommended first-launch alerts

1. health endpoint failing
2. readiness endpoint failing
3. repeated auth failures spike
4. upload failures spike
5. database connection failures

## TEMP / Tech Debt

1. readiness currently validates storage configuration, not a live object-store round trip
2. backup and rollback are documented but not yet automated
3. no external APM or error aggregation is wired yet
