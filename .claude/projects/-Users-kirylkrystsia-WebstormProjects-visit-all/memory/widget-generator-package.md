---
name: widget-generator-package
description: Published AI widget generation package, runtime boundaries, and release status
metadata:
  type: project
---

`@synarava/widget-generator@0.1.0` is published independently from
`/Users/kirylkrystsia/WebstormProjects/synarava-widget-generator`. Visit All
consumes that exact GitHub Packages version and has no internal generator
workspace package.

Public surfaces:
- root: shared types plus migration-compatible exports
- `/server`: generation context, prompts, Anthropic invocation, strict response parsing
- `/executor`: browser JSX/TypeScript compilation, module allowlisting, React error boundary

The package owns generation and execution contracts. The app owns API keys,
streaming routes, persistence, product entities, module allowlists, placement,
shell presentation, and widget glass settings.

Release `0.1.0` passed typecheck, lint, 19 tests, native ESM verification,
dependency audit, dry-run tarball inspection, and a clean registry install/import.
