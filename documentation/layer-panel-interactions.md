# Layer Panel Interactions

## Goal

Restore interactive behavior in the Figma-aligned layer panel without losing the visual alignment work.

## Required behavior

1. A layer card can still expand into edit mode.
2. Expanded state must keep editable layer name and color controls.
3. `Done` still confirms the layer when needed for a pending pin.
4. The eye icon must remain visible in the card header.
5. Toggling the eye icon must show or hide pins that belong to that layer.
6. Selecting a layer card should still move it to the top and keep the pending-pin confirmation flow.

## Implementation notes

1. Preserve the Figma card layout for the collapsed state.
2. Keep edit controls in an expandable region below the card header.
3. Track hidden layer ids at page level and pass them to the map and sidebar.
4. Filter rendered pins by `collection_id` in the map layer.
