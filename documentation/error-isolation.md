# Error Isolation

## Goal

Localize failures so one broken surface does not take down the rest of the product.

The rule is simple:

1. broken widget -> only that widget falls back
2. broken shell -> only that shell falls back
3. broken map -> only the map falls back

## Current boundaries

### Widget boundary

Implemented around each shell widget render in:

- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/ui/Sidebar.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/ui/Sidebar.tsx)
- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/errors/WidgetErrorBoundary.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/errors/WidgetErrorBoundary.tsx)

Behavior:

1. one widget can crash
2. the shell remains mounted
3. other widgets continue working
4. the failed widget shows a red fault card with retry

### Shell boundary

Implemented for:

1. top chrome shell
2. left sidebar shell

Files:

- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/errors/ShellErrorBoundary.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/errors/ShellErrorBoundary.tsx)
- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx)

Behavior:

1. if the shell container crashes, only that shell is replaced
2. map and other shells continue running

### Map boundary

Implemented in:

- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/errors/MapErrorBoundary.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/errors/MapErrorBoundary.tsx)
- [/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx)

Behavior:

1. map can fail independently
2. shells and widgets stay alive
3. map area shows a dedicated fault surface with retry

## Important limitation

React error boundaries catch:

1. render errors
2. lifecycle errors
3. client component tree crashes

They do not automatically catch every async event-handler or server-action failure.

Those still need local error handling in the relevant flow.

## Design language

Error fallbacks should:

1. be visibly red and explicit
2. stay localized to the failed surface
3. offer retry
4. not replace the whole application unless the whole application is actually broken
