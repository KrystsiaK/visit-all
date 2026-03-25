# CI/CD Readiness

## Current state

The repo now has a baseline CI/CD skeleton:

1. `npm run ci:quality`
2. `npm run ci:verify`
3. GitHub Actions workflow in `.github/workflows/ci.yml`
4. git hooks in `.husky/pre-commit` and `.husky/pre-push`
5. Sonar config in `sonar-project.properties`

Current verification status:

1. `npm run ci:quality` passes
2. `npm run test:e2e` passes
3. GitHub Actions workflow is ready to enforce the same checks in CI
4. CI is ready to apply SQL migrations before quality and e2e checks

## Proposed quality gates

### Local

1. pre-commit:
   run lint
   run unit tests
2. pre-push:
   run full quality gate

### CI

1. apply SQL migrations
2. lint
3. typecheck
4. production build
5. unit tests
6. security audit
7. e2e tests when required secrets are present
8. Sonar scan when `SONAR_TOKEN` is configured

## Current blocker

The baseline quality gate is now green. The remaining CI/CD blockers are no longer lint debt; they are production process gaps:

1. GitHub secrets still need to be configured for protected-branch CI
2. Sonar is configured but not yet active until `SONAR_TOKEN` is added
3. e2e in CI depends on environment secrets and a stable deployment target
4. release, rollback, and incident steps are not yet codified

## Recommendation

1. keep the strict CI pipeline
2. do not weaken the gate now that it is green
3. make CI required on the protected branch after secrets are wired
4. add deployment promotion and rollback stages next

## Sonar

Recommended usage:

1. use SonarCloud or SonarQube only after the lint/type/test baseline is stable
2. wire `SONAR_TOKEN` in GitHub secrets
3. keep Sonar as an additional signal, not a replacement for lint/tests

## TEMP / Tech Debt

1. Sonar is configured but inactive until repository secrets are wired
2. e2e CI is conditional on secrets and environment setup
