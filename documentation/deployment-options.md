# Deployment And Storage Options

## Goal

Choose a deployment shape that is cheap enough for early production, reliable enough for public use, and compatible with the future entity/media architecture.

## Recommended baseline

### Option A. Lowest-friction production path

1. app runtime: Railway
2. database: Railway Postgres
3. media storage: Cloudflare R2

Why:

1. simplest operational story if you already have Railway
2. cheap entry cost
3. no local-disk media risk
4. R2 is well-suited for user-uploaded media because egress is inexpensive to zero from the app’s point of view

### Option B. Best Next.js platform DX

1. app runtime: Vercel
2. database: Railway Postgres
3. media storage: Cloudflare R2

Why:

1. strongest alignment with Next.js deployment ergonomics
2. good preview deployment story
3. easy production frontend workflow

Tradeoff:

1. more moving parts across providers
2. cost can climb faster on Vercel if compute and media usage grow

## Media recommendation

Preferred media storage for cost-sensitive production:

1. Cloudflare R2

Reason:

1. lower storage cost than Vercel Blob
2. egress-friendly for serving public media
3. fits the planned “DB stores metadata, object storage stores binaries” model

Secondary option:

1. Railway Object Storage

Reason:

1. attractive if you want fewer vendors
2. may be operationally simpler if the whole stack stays on Railway

## Storage implementation status

Current codebase status:

1. storage is now abstracted behind a provider adapter
2. supported providers:
   `local`
   `s3`
3. `s3` mode is intended for Cloudflare R2 and other S3-compatible storage
4. current UI compatibility still stores a final public URL in the DB

Required production envs for `s3` mode:

1. `STORAGE_PROVIDER=s3`
2. `S3_BUCKET`
3. `S3_REGION`
4. `S3_ENDPOINT`
5. `S3_ACCESS_KEY_ID`
6. `S3_SECRET_ACCESS_KEY`
7. `S3_PUBLIC_BASE_URL`

## What not to ship

1. local `/public/uploads`
2. hardcoded auth secret fallback
3. production without rate limiting on auth/uploads

## Source links

Official pages reviewed:

1. Vercel pricing: https://vercel.com/pricing
2. Vercel pricing docs: https://vercel.com/docs/pricing
3. Railway pricing: https://railway.com/pricing
4. Cloudflare R2 pricing: https://workers.cloudflare.com/product/r2/
5. Backblaze B2 pricing reference: https://help.backblaze.com/hc/en-us/articles/360037814594-B2-Pricing

## Initial recommendation

If the goal is cheapest reliable launch with minimal platform thrash:

1. start with Railway app + Railway Postgres + Cloudflare R2

If the goal is best Next.js deployment experience and preview environments:

1. use Vercel app + Railway Postgres + Cloudflare R2

## Current project decision

For the first production launch, the project now treats this as the canonical path:

1. Railway app + Railway Postgres + Cloudflare R2

## TEMP / Tech Debt

1. final provider choice should happen only after expected traffic, preview workflow, and media volume are clarified
2. whichever option we choose, media must be abstracted behind a storage adapter before launch
3. current DB still stores `image_url` only; later media records should store canonical storage metadata and lifecycle state
