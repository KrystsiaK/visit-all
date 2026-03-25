# Layer Visibility Model

## Goal

Layer visibility should follow the same mental model as a mixer:

1. `mute` hides a layer explicitly
2. `solo` focuses playback / visibility on one or more layers
3. these are separate flags
4. the map only renders entities that pass the final visibility predicate

## Best-practice direction

The model is based on common mixer behavior:

1. Mute is an explicit per-track off flag
2. Solo is an explicit focus flag, not a side effect of muting others
3. Rendering should not read button state directly
4. Rendering should only read one final `isVisible(layer)` decision

References:

1. Apple Logic Pro explains mute and solo as separate controls, where solo silences other strips while mute remains its own state: [Logic Pro User Guide](https://support.apple.com/guide/logicpro/mute-and-solo-channel-strips-lgcpbc21a09d/mac)
2. Audacity documents a multi-track solo mode where multiple soloed tracks can remain active together: [Audacity Manual](https://manual.audacityteam.org/man/tracks_behaviors_preferences.html)

## Canonical state

We keep two state buckets:

1. `hiddenCollectionIds`
2. `focusedCollectionIds`

Rules:

1. `hiddenCollectionIds` means user explicitly hid these layers
2. `focusedCollectionIds = null` means no solo/focus mode is active
3. `focusedCollectionIds = [...]` means only those layers may be shown, unless a layer is also hidden

## Final visibility predicate

```ts
isVisible(layer) =
  !hiddenCollectionIds.includes(layer.id) &&
  (focusedCollectionIds === null || focusedCollectionIds.includes(layer.id))
```

This is the only rule that map/entity rendering should use.

## Behavior rules

### Eye

1. If no focus mode is active, `eye` just toggles hidden state
2. If focus mode is active and the clicked layer is focused, turning eye off removes it from focus
3. If it was the only focused layer, eye-off exits focus mode and hides only that layer
4. If focus mode is active and the clicked layer is not visible, eye-on restores it and includes it in focus

### Show Only

1. With no focus mode active, clicking `Show Only` starts focus mode with one layer
2. Clicking `Show Only` on another hidden layer adds it to the focused set
3. Clicking `Show Only` on a visible focused layer narrows focus back to that one layer
4. Clicking `Show Only` on the only focused layer exits focus mode and shows all non-muted layers

## Architectural rule

Map layers, pin arrays, path arrays, and area arrays must never reimplement visibility rules separately.

They should all consume the same computed invisible/visible set.

## TEMP / Tech Debt

Legacy entities without proper layer bindings still remain a data-quality issue.

That is separate from the visibility model itself and should be fixed by data repair / migration, not by adding more UI-state exceptions.
