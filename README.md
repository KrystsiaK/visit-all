# Visit All

Interactive geographic curation app built with Next.js 16, Postgres, MapLibre, and a widget-driven entity model.

## Local setup

1. install dependencies
```bash
npm install
```
2. create local envs from [.env.example](/Users/kirylkrystsia/WebstormProjects/visit-all/.env.example)
3. start the app
```bash
npm run dev
```
4. open [http://localhost:3000/login](http://localhost:3000/login)

Demo credentials:

```text
demo@visitall.com
demo
```

## Quality checks

```bash
npm run db:migrate
npm run ci:quality
npm run test:e2e
```

## Required environment variables

### Core

1. `DATABASE_URL`
2. `AUTH_SECRET`

### Storage

Development:

1. `STORAGE_PROVIDER=local`

Production:

1. `STORAGE_PROVIDER=s3`
2. `S3_BUCKET`
3. `S3_REGION`
4. `S3_ENDPOINT`
5. `S3_ACCESS_KEY_ID`
6. `S3_SECRET_ACCESS_KEY`
7. `S3_PUBLIC_BASE_URL`

## Health check

Service health endpoint:

```text
GET /api/health
```

## Deployment

Recommended first production shape:

1. Railway app
2. Railway PostGIS
3. Cloudflare R2

Supporting docs:

1. [deployment-options.md](/Users/kirylkrystsia/WebstormProjects/visit-all/documentation/deployment-options.md)
2. [deployment-matrix.md](/Users/kirylkrystsia/WebstormProjects/visit-all/documentation/deployment-matrix.md)
3. [production-readiness-plan.md](/Users/kirylkrystsia/WebstormProjects/visit-all/documentation/production-readiness-plan.md)
4. [railway-r2-deploy.md](/Users/kirylkrystsia/WebstormProjects/visit-all/documentation/railway-r2-deploy.md)
