# Security Findings

## Scope

Initial production-readiness audit of application code, auth flow, uploads, environment handling, and dependency posture.

## Current status

### Dependency scan

1. `npm audit --omit=dev` is currently clean: no known production dependency vulnerabilities were reported at scan time.

## Findings

### High

1. Auth secret had an insecure fallback in code.
   File: `src/auth.config.ts`
   Previous risk: if `AUTH_SECRET` was missing in production, sessions would fall back to a hardcoded secret that was predictable and shared across environments.
   Status: mitigated.
   Current behavior: production now requires `AUTH_SECRET`; local development uses a local-only dev fallback and the local environment has been given an explicit secret.

2. Upload pipeline accepted files without type, size, or content validation.
   File: `src/app/actions.ts`
   Previous risk: unrestricted uploads increased abuse risk, storage exhaustion risk, and unsafe file handling risk.
   Status: partially mitigated.
   Current behavior: mime type, size, and filename validation now exist, but production object storage and stronger scanning/lifecycle controls are still pending.

### Medium

1. Local media storage under `/public/uploads` is not production-safe.
   Files: `src/app/actions.ts`, `src/lib/storage.ts`
   Risk: no object storage durability, no lifecycle policy, no signed access strategy, and poor horizontal scaling.
   Status: partially mitigated.
   Current behavior: code now supports S3-compatible object storage through a storage adapter, but production still requires real provider configuration and local disk remains available as a transitional fallback.

2. Proxy hardening is still minimal.
   File: `src/proxy.ts`
   Status: partially mitigated because the deprecated `middleware` convention has been removed.
   Remaining risk: matcher/auth flow is still simple and should be reviewed together with CSP and rate-limiting strategy before launch.

3. Database pool config is minimal.
   File: `src/lib/db.ts`
   Risk: no explicit SSL/pool hardening knobs for production environments.
   Required fix: verify managed Postgres SSL requirements and set production-safe pool config.

4. No explicit rate limiting or abuse controls were found for auth or uploads.
   Risk: brute-force and resource abuse exposure.
   Status: partially mitigated.
   Current behavior: a Postgres-backed limiter now protects login attempts and authenticated uploads. Future traffic may justify moving hot-path limiting to edge or Redis infrastructure.

### Low / Structural

1. Basic security headers now exist in `next.config.ts`, and a baseline CSP/HSTS policy is now in place, but the CSP is still pragmatic rather than nonce-based.
2. CI security gate, git hooks, Sonar config, and GitHub Actions now exist, but branch protection and secrets wiring are still pending.
3. Production environment variable governance is partially improved, but the final deployment matrix is not locked yet.

## Immediate priority order

1. remove fallback auth secret behavior
2. move media off local disk
3. add rate limiting for login and uploads
4. add CI quality and security gates
5. extend header hardening and CSP strategy

## Verified after remediation

1. `npm audit --omit=dev` is clean
2. `npm run ci:quality` passes
3. `npm run test:e2e` passes
4. baseline rate limiting exists for login and uploads
5. baseline CSP and HSTS headers exist

## TEMP / Tech Debt

1. archive/container transition is still in progress, so some entity writes still go through legacy tables
2. local uploads are explicitly transitional and must not be treated as final production storage
