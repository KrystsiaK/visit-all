# Liquid Glass System

## Purpose

`@synarava/liquid-glass` is the shared material and motion layer for Synarava UI.

It exists so we do not repeat blur, optical layering, edge treatment, and motion tokens in every shell and widget.

## What belongs here

1. glass surface variants
2. tone variants
3. motion tokens
4. optical overlay treatment
5. shared glass wrappers for Storybook and design review

## What does not belong here

1. business widgets
2. shell orchestration
3. product-specific spacing hacks
4. map logic

## Surface variants

Current variants:

1. `shell`
2. `shellStrong`
3. `widget`
4. `pill`
5. `control`
6. `inset`

## Tone variants

Current tones:

1. `neutral`
2. `mist`
3. `cream`
4. `rose`

## Best-practice guidance

The design target is not decorative glass and not "white cards with blur".

The design target is:

1. readable layers
2. restrained translucency
3. consistent hierarchy
4. optical depth
5. calm motion
6. believable behavior over noisy backgrounds

This follows the direction encouraged by:

1. Apple HIG materials guidance: glass and translucency work best for navigation and controls, not every content panel
2. Apple HIG motion guidance: continuity first, hierarchy first, no competing motion
3. Storybook component-first workflows: document states, interactions, and visual variants in isolation before product reuse

## Packaging rule

`liquid-glass` should remain a separate workspace package.

That means:

1. the package owns the reusable material language
2. app code should import from the package instead of redefining visual recipes locally
3. Storybook can stay shared at the monorepo root and still showcase all packages together

The package is separate.
The Storybook is shared.

## How shell-kit should use it

1. `shell-kit` owns shell and widget structure
2. `liquid-glass` owns material and motion tokens
3. `shell-kit` should import the tokens rather than restating them inline

That means:

1. `BaseShell` and `DockedShell` use shared motion and surface defaults
2. `BaseWidget` uses shared widget and inset surfaces
3. pills and control buttons use shared pill/control surfaces

## Storybook rule

Every major material change should be visible in Storybook before it is rolled through the app.

That means:

1. `Liquid Glass/Overview` should prioritize real scenes over token dumps
2. `Material Matrix` can exist as a reference, but should not be the main proof
3. `Shell Kit/Overview` should show how those materials behave in real shells
4. new shell or widget primitives should add stories before broad rollout

## Motion review rule

`liquid-glass` motion should be reviewed through real interaction states, not abstract demo cards.

That means:

1. hover is tested on real controls, pills, widgets, and shell surfaces
2. focus is tested on a reusable glass input primitive
3. motion should feel tactile and calm, not theatrical
4. if a motion example cannot map back to a product interaction, it does not belong in the main review flow

## Current review scenes

The main review stories for the package are now:

1. `Premium Scenes`
2. `Interactive Background Lab`
3. `Hover Lab`
4. `Focus Lab`

`Material Matrix` remains a supporting reference only.
