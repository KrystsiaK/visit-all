# UI Shell Visual Contract

## Goal

Define the visual rules for the shell system so UI regressions are treated as contract violations, not as subjective polish notes.

This document exists to stop three kinds of drift:

1. two surfaces that look similar but are implemented differently
2. pinned widgets overlapping the main widget stack
3. shell spacing being tuned widget-by-widget instead of by one shell layout contract

## Core rule

If two shell surfaces are the same visual species, they must share:

1. one surface primitive
2. one spacing rhythm
3. one pinned-vs-main layout contract
4. one test strategy

If they do not share those things, the UI system is already drifting.

## Default desktop view

The default desktop map workspace currently includes three shell-like surfaces:

1. top-left hero chrome
2. left sidebar shell
3. right entity shell

The product intent is that these feel like one system, not three unrelated cards.

## Visual invariants

These are not suggestions. They are pass/fail conditions.

### Hero and first widget separation

Whenever a shell has a pinned hero block and then a main widget stack:

1. the first main widget must start below the pinned hero
2. the first main widget utility bar must not render under the pinned hero
3. the shell must own the gap between pinned and main regions
4. individual widgets must not compensate with local negative margins or ad hoc padding

### Pinned widget behavior

Pinned widgets are a shell capability, not a widget-specific hack.

Therefore:

1. the shell decides where pinned content lives
2. the shell decides the gap between pinned and main content
3. widgets may expose different presentations such as `default` and `pinned`
4. widgets must not invent independent pinned positioning behavior

### Surface consistency

Hero cards that represent the same surface species must reuse the same primitive.

Current canonical primitive:

`src/components/shells/ShellHeroCard.tsx`

This primitive currently backs:

1. the top-left `Visit` hero
2. the pinned entity hero on the right shell

## Test strategy

For shell layout, browser tests must check geometry, not just visibility.

Minimum required Playwright assertions:

1. top-left hero bottom is above the first left-shell widget top by at least one shell gap
2. right pinned hero bottom is above the first entity widget top by at least one shell gap
3. opening a known seeded pin produces the same right-shell structure every run

Current contract suite:

`tests/e2e/shell-visual-contract.spec.ts`

## Required test hooks

The UI system is allowed to expose stable `data-testid` attributes for structural verification.

These are part of the contract, not disposable test noise.

Current required hooks:

1. `top-chrome-hero`
2. `shell-search-widget`
3. `entity-pinned-hero`
4. `entity-rating-widget`
5. seeded map marker id for the contract pin

## Review rule

A shell/UI change is not complete unless:

1. the code uses the canonical shell primitive path
2. the relevant visual contract doc still describes reality
3. Playwright shell contract tests pass

If a layout fix only works because one specific widget changed its local padding, it is not a real shell fix.
