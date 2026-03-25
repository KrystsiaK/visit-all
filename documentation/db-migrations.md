# Database Migrations

## Goal

Move schema changes from ad-hoc runtime bootstrap toward explicit, repeatable SQL migrations.

## Decision

Use a lightweight SQL migration runner on top of `pg`.

Why:

1. no extra ORM or framework migration lock-in
2. easy to inspect in production
3. works with current Postgres/PostGIS setup

## Files

1. migrations live in `db/migrations`
2. applied migrations are tracked in `schema_migrations`
3. runner scripts live in `scripts/`

## Commands

1. `npm run db:migrate`
2. `npm run db:migrate:status`

## Current rollout strategy

1. baseline migration creates current schema
2. new schema changes must be added as new numbered SQL files
3. runtime schema DDL has been removed from the main request path

## TEMP / Tech Debt

1. rollback SQL is not automated; for first launch we rely on restore/redeploy procedure
2. schema changes still need disciplined review because the runner is intentionally lightweight
