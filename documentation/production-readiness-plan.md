# Production Readiness Plan

## Goal

Prepare the project for production across four fronts:

1. application security
2. dependency and infrastructure risk
3. CI/CD and quality gates
4. deployment and media-storage architecture

## Workstreams

### Phase 1. Security audit

1. scan dependencies for known vulnerabilities
2. audit auth, session, and middleware behavior
3. review server actions, database access, file upload paths, and authorization checks
4. identify missing hardening such as rate limits, CSP, secure headers, secrets handling, and input validation
5. classify findings by severity and remediation effort

### Phase 2. Quality and CI/CD

1. define required gates for every pull request
2. add git hooks for local fast feedback
3. define CI jobs for lint, typecheck, unit, e2e, and audit
4. evaluate Sonar and other static analysis layers
5. define release workflow, environment promotion, and rollback basics

### Phase 3. Deployment architecture

1. decide app hosting target
2. decide database/runtime topology
3. decide media storage target
4. define environment variables and secret management
5. define backup, observability, and incident basics

### Phase 4. Delivery plan

1. quick wins to implement immediately
2. medium-risk changes before first production launch
3. postponed items explicitly marked as tech debt

## Deliverables

1. security findings register
2. recommended CI/CD pipeline
3. deployment recommendation with alternatives
4. media storage recommendation with pricing tradeoffs
5. sequenced implementation backlog

## Current status

1. baseline security remediation is in place:
   required auth secret in production, hardened upload validation, proxy migration, basic security headers, baseline rate limiting
2. baseline quality gate is green:
   `npm run ci:quality` passes
3. baseline regression coverage is green:
   `npm run test:e2e` passes
4. production hosting and storage decision is still pending
5. remaining launch blockers are now mostly architectural, not hygiene-level

## Next production chunks

1. continue archive/container migration off legacy entity writes
2. decide whether first-launch rate limiting should stay on Postgres or move to an edge/provider layer
3. wire external error tracking / APM if needed before public launch
4. tighten CSP further if/when external demo assets are removed
5. lock production provider choice and wire final secrets

## Completed deployment prep

1. deployment matrix documented
2. environment matrix documented
3. health endpoint added
4. Railway healthcheck config added
5. readiness endpoint added
6. minimum operations runbook documented
7. formal SQL migration runner added
8. runtime schema bootstrap removed from core request paths
9. Railway + R2 deployment runbook documented
10. canonical production provider path documented
11. production secrets checklist documented
12. optional observability scaffold added

## In progress now

1. storage adapter step:
   bridge current upload flow to S3-compatible object storage without blocking on the full media-schema redesign

## TEMP / Tech Debt

1. current local uploads in `/public/uploads` are transitional and must be replaced before production
2. entity container migration is still transitional; some reads and writes still bridge legacy tables
