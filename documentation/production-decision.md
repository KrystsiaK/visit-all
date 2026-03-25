# Production Decision

## Decision

For first public launch, use:

1. Railway for the Next.js app
2. Railway Postgres for the database
3. Cloudflare R2 for media

## Why this is now the canonical path

1. lowest operational overhead
2. already aligned with current app runtime shape
3. no need to split app and DB vendors immediately
4. R2 keeps media cost and egress risk lower than storing binaries on app disk

## What this means

1. Railway is the default deployment target for this repo
2. `railway.json` is the primary deploy config
3. `documentation/railway-r2-deploy.md` is the canonical runbook
4. Vercel remains a documented alternative, not the default

## Deferred alternative

Vercel + Railway Postgres + R2 remains valid if:

1. preview deployments become a stronger priority
2. frontend platform ergonomics outweigh single-vendor simplicity

## TEMP / Tech Debt

1. preview/staging deployment topology is not finalized
2. if traffic or team workflow changes, this decision can be revisited later
