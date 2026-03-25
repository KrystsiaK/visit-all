# Pin To Layer Flow

## Goal

Make pin creation deferred until the user explicitly confirms a layer selection.

## Required behavior

1. Clicking the map in `pin` mode creates a pending pin preview only.
2. The pending pin is not saved until the user confirms a layer.
3. While a pin is pending, the layers panel should visually hint that a layer must be chosen.
4. Selecting an existing layer should move that layer to the top and immediately save the pending pin into it.
5. Creating a new layer should open it in edit mode and only count as selected after `Done` is pressed.
6. If a layer is already open in edit mode, choosing it for the pending pin also requires `Done`.
7. After confirmation, the saved pin should use the layer color for the colored part of the pin icon.
8. Layer cards should show attached item counts instead of the placeholder `Layer Group`.

## Implementation steps

1. Add pending pin state in the page-level controller and stop saving pins directly on map click.
2. Add a reusable collection reorder helper so the last confirmed layer moves to the top.
3. Update collection fetching/creation to include item counts needed by the sidebar cards.
4. Rework sidebar layer interactions:
   - card click confirms an existing layer when it is not in edit mode
   - `More` opens edit mode
   - `Done` confirms the layer when edit mode is open
5. Add pending-selection UI cues in the sidebar and keep the draft pin visible on the map.
6. Update the pin icon component so saved pins inherit the collection color.
7. Verify with `npm run build` and targeted runtime checks.
