# Widgets Figma Step

## Goal

Bring the widget experience in line with the Figma design node `1:827` from `visit all main`, while keeping existing working behavior unless the design explicitly replaces it.

## Required implementation order

1. Disable the `Zone` mode button in the left mode switcher for now.
2. Fetch Figma MCP design context for node `1:827`.
3. Fetch the screenshot for the same node and use it as the visual source of truth.
4. Compare the Figma widget design to the current implementation in `src/components/glass/WidgetOverlay.tsx`.
5. Rebuild the widget UI to match the design more closely without removing current pin-editing functionality unless necessary.
6. Keep delete, image upload, and note editing behavior working after the redesign.
7. Build and verify the app after the implementation.

## Constraints

1. Do not guess the widget layout without checking Figma MCP first.
2. Keep the current data flow for pin editing unless the design requires a specific structural change.
3. Preserve the current ability to delete a pin from the widget panel.
4. Preserve the current ability to edit the note and upload an image.
