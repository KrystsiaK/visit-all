# Media Storage Adapter

## Goal

Replace direct local-disk coupling with a storage adapter that supports production object storage without forcing a full media-schema migration in the same step.

## Current decision

1. introduce a single storage adapter in code
2. support two providers:
   `local`
   `s3`
3. use `s3` mode for Cloudflare R2 and other S3-compatible object stores
4. keep local disk only as a transitional development fallback

## Why this step matters now

1. local `/public/uploads` is not acceptable for production
2. deployment can proceed only if binary storage is externalized
3. this creates a stable interface before the later media/enrichment schema refactor

## Adapter contract

1. upload:
   accept a validated `File`
   return a public URL string for current UI compatibility
2. delete:
   accept the stored URL
   delete the underlying binary if it belongs to the active provider
3. configuration:
   select provider through environment variables

## Environment shape

### Local

1. `STORAGE_PROVIDER=local`

### S3-compatible

1. `STORAGE_PROVIDER=s3`
2. `S3_BUCKET`
3. `S3_REGION`
4. `S3_ENDPOINT`
5. `S3_ACCESS_KEY_ID`
6. `S3_SECRET_ACCESS_KEY`
7. `S3_PUBLIC_BASE_URL`

## R2 mapping

Cloudflare R2 should use the same `s3` adapter with:

1. custom `S3_ENDPOINT`
2. bucket name
3. public base URL from CDN/custom domain

## TEMP / Tech Debt

1. current DB still stores only `image_url`, not a full media asset record
2. delete currently infers object key from URL; later schema should store canonical storage metadata
3. signed/private media access is not part of this step
