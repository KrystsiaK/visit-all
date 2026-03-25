# Observability Scaffold

## Goal

Provide a minimal production-ready observability hook without forcing a full vendor rollout on day one.

## Current choice

Use Next.js instrumentation with `@vercel/otel`, but keep it disabled by default.

## Enable flag

1. `OTEL_ENABLED=true`

## Service name

1. `OTEL_SERVICE_NAME=visit-all`

## Why this approach

1. aligned with Next.js 16 instrumentation model
2. low-risk optional scaffold
3. easy to expand later into a real collector/exporter pipeline

## TEMP / Tech Debt

1. this is a scaffold, not a full observability rollout
2. no external collector/export destination is configured yet
3. logs, metrics, and alert routing still need a future dedicated step if required
