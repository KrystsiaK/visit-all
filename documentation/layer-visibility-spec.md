# Layer Visibility Spec

## Purpose

This spec defines the only allowed behavior for layer visibility.

It exists so we stop patching UI symptoms and instead implement one explicit contract.

## Core model

Each layer has two independent flags:

1. `muted: boolean`
2. `solo: boolean`

No button is allowed to secretly rewrite the meaning of the other flag.

## Canonical state shape

```ts
type LayerVisibilityFlags = {
  muted: boolean;
  solo: boolean;
};

type LayerVisibilityMap = Record<string, LayerVisibilityFlags>;
```

## Final visibility rule

The UI and map must never derive visibility directly from button presses.

They must always compute:

```ts
const hasAnySolo = someLayerHasSoloTrue;

isVisible(layer) =
  !layer.muted &&
  (!hasAnySolo || layer.solo)
```

This is the single source of truth.

## Button rules

### Mute button

Meaning:

1. toggle only `muted` on this layer
2. do not automatically enable `solo`
3. do not automatically disable `solo` on other layers

Allowed side effect:

1. if the same layer is currently `solo=true` and the user mutes it, that layer's own `solo` may be cleared

Not allowed:

1. unmuting a layer must never auto-enable `solo`
2. muting one layer must never change `solo` on unrelated layers

### Show Only button

Meaning:

1. toggle only `solo` on this layer
2. do not write `muted` flags

Allowed behavior:

1. multiple solo layers may coexist
2. turning off the last solo layer exits solo mode globally

Not allowed:

1. `show only` on one layer must not silently switch off `show only` on another layer
2. `show only` must not mutate `muted`

## Visual rules

### Eye icon

Render from `isVisible(layer)` or from `muted` depending on design choice, but be explicit:

Recommended:

1. `Eye` means layer is not muted
2. `EyeOff` means layer is muted

Important:

1. solo mode must not cause fake mute visuals
2. a non-muted layer hidden only because another layer is soloed should not appear as manually muted

### Show Only icon

1. active state depends only on `solo === true`
2. inactive state depends only on `solo === false`

## Architectural layering

### Domain layer

Pure functions only:

1. `toggleMute(layerId)`
2. `toggleSolo(layerId)`
3. `isVisible(layerId)`
4. `hasAnySolo()`

No React, no map code, no DOM assumptions.

### UI layer

Buttons dispatch domain actions.

The sidebar must not invent visibility behavior on its own.

### Rendering layer

Map rendering filters `pins`, `traces`, and `areas` by `isVisible(collectionId)`.

No entity type is allowed to implement a different rule.

## Data-quality rule

If an entity has no layer binding, that is a data integrity issue.

The visibility subsystem should not compensate with special UI behavior.

Instead:

1. mark it as legacy
2. repair or migrate the data

## Explicit non-goals

This system should not:

1. reorder layers
2. auto-select active layer
3. infer user intent from previous clicks
4. translate mute into solo or solo into mute

## Implementation note

The next implementation pass should replace ad-hoc arrays with a single visibility reducer / store whose only job is `muted`, `solo`, and `isVisible`.
