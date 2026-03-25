# Layer Panel Figma Alignment

## Figma source

- File: `visit all main`
- Node: `1:128`
- URL: `https://www.figma.com/design/NVMElLMLH5B28iQZOY8EQ7/visit-all-main?node-id=1-128&t=G5WpRT3NQOAVFDav-1`

## Goal

Align the sidebar layer stack to the Figma panel while keeping product behavior that is not explicitly represented in the static frame.

## Visual requirements from Figma

1. Outer panel:
   - translucent white glass surface
   - 16px radius
   - subtle black border
   - soft shadow
   - tight inner padding
2. Layer cards:
   - 66px height
   - 12px radius
   - active card uses stronger white fill and stronger border
   - inactive cards use lighter white fill and lighter border
   - 4px rounded vertical accent color bar on the left
   - title `14/20 medium`
   - subtitle `12/16 regular`, muted gray
   - compact action icon on the right
3. Vertical rhythm:
   - 8px gap between cards
   - no yellow instruction banner above the stack

## Functional requirements to preserve

1. Pending pin flow stays intact.
2. Layer panel still hints selection during pending pin, but through the panel styling rather than a separate banner.
3. Creating a new layer must still be available.
4. Editing an existing layer and confirming with `Done` must still work.
5. Selecting an existing layer during pending pin must still save the pin and move the layer to the top.

## Implementation notes

1. Restyle the existing `collections` section in the sidebar to match the Figma geometry and spacing.
2. Keep the create action, but integrate it without breaking the stacked-card composition.
3. Preserve edit controls by showing them only when a layer is expanded.
4. Use the project’s existing motion and glass helpers where possible.
