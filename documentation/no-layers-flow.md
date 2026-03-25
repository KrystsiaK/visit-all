# No Layers Flow

## Goal

Handle the empty-state pin flow without forcing the user to create a layer up front, while keeping the interaction understandable.

## Required behavior

1. If there are no layers, the sidebar should show only the `New Layer` call to action instead of the layer stack.
2. If the user places a pin while there are no layers, the app should automatically create a layer with the title `undefined`.
3. That auto-created layer should open expanded in edit mode immediately.
4. The pending pin should still wait for confirmation via `Done`.
5. If the pending pin is cancelled, the auto-created layer should also be removed.
6. If the auto-created layer ends up with exactly that one saved pin and the pin is later deleted, the layer should also be deleted.

## Animation goal

1. The pending-layer attention state should feel smoother and more intentional.
2. The animation should be more noticeable than before, but still restrained.
3. Use the existing motion stack already present in the project unless a new dependency is truly necessary.

## Implementation notes

1. Track the auto-created layer id at page level.
2. Reuse the existing collection creation and deletion actions.
3. Let the sidebar open the auto-created layer directly in edit mode.
4. Keep the empty-state CTA visible only when there are no collections to choose from.
5. Refine the panel shimmer and card transitions with `framer-motion`.
