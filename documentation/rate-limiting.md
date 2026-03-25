# Rate Limiting

## Goal

Add baseline abuse protection to the two highest-risk flows before launch:

1. credential login attempts
2. authenticated media uploads

## Decision

Use a shared Postgres-backed limiter instead of an in-memory limiter.

Why:

1. works across multiple runtime instances
2. requires no separate Redis service for the first production launch
3. fits Railway/Vercel + Postgres deployment shapes

## Protected flows

### Auth

1. scope: `auth_login`
2. identifier: hashed combination of normalized email and client IP when available
3. default threshold:
   10 attempts per 15 minutes
4. temporary block:
   30 minutes

### Uploads

1. scope: `media_upload`
2. identifier: hashed authenticated user id
3. default threshold:
   20 uploads per 10 minutes
4. temporary block:
   10 minutes

## Data handling

1. limiter stores only hashed identifiers
2. raw email and IP are not persisted in limiter rows

## TEMP / Tech Debt

1. first launch uses Postgres for rate limiting; if traffic grows, move hot-path limiting to an edge or Redis-based layer
2. current limiter protects login and uploads only; other mutating actions can be evaluated later if abuse appears
