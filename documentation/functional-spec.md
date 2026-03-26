# Visit All Functional Spec

## Purpose

This is the living product behavior document for the current implementation. We update this file whenever a major interaction rule changes, so development can follow one continuously maintained source of truth.

## Current interaction model

### Layers

1. `New Layer` must always be visible.
2. The layer stack panel is shown only when at least one layer exists.
3. Ordinary layer selection does not reorder the stack by itself.
4. A layer moves to the top only when a new entity is attached to it or when edits to that layer are confirmed.
5. In ordinary layer mode, clicking a layer card opens it for editing on the first click.
6. A layer in edit mode is confirmed with `Done`.
7. The eye icon toggles visibility of all entities that belong to that layer.
8. The last icon on the layer card isolates that layer and hides all other layers; clicking it again restores all layers.
9. Layer cards show the number of attached items instead of the placeholder subtitle.
10. Deleting a layer must always show a warning popup first.
11. Deleting a layer removes the layer and all entities that belong to it.

### Pins

1. Clicking the map in `pin` mode creates a pending pin first.
2. A pending pin is not saved until a layer is confirmed.
3. If there are no layers yet, placing a pin auto-creates a layer titled `undefined` and opens it in edit mode.
4. Cancelling that pending pin also deletes the auto-created layer.
5. Clicking the pending pin again cancels it.
6. Saved pins inherit the selected layer color in the pin visual.

### Pin deletion

1. Unsaved pending pins are deleted by clicking them again on the map.
2. Saved pins are deleted from the widget overlay.
3. If an auto-created layer contains only the deleted saved pin, that layer is deleted too.

### Paths

1. Path creation is being redesigned around a draft-first flow.
2. The intended direction is:
   - click to add draft nodes
   - drag nodes to correct the line
   - double click a node to remove it
   - finish explicitly with a `Finish Path` CTA above layers
   - only then choose/confirm a layer
3. The detailed proposal lives in `documentation/path-draft-flow.md`.
4. The old `Geometry Outline` block is removed in favor of the single `Finish Path` CTA.
5. Saved paths and zones should render using the current layer color.

### Empty state

1. When there are no layers, the interface should not show an empty layer stack panel.
2. In that state, the user still sees the `New Layer` call to action.

### Primary CTA

1. `New Layer` is the persistent creation CTA in the sidebar.
2. The `New Layer` CTA should use a solid Mondrian-inspired treatment rather than a translucent glass style.
3. The old `Add New Marker` bottom CTA is removed to avoid competing actions.

### Shell lock during authoring

1. During pending authoring flows, the left shell should behave as a guided surface rather than a fully open control board.
2. While a pending pin exists, or while a path or area draft is actively being drawn, non-essential shell controls should be disabled.
3. The shell must keep these widgets active:
   - collection search
   - collection stack
   - `New Layer`
   - mode switch
4. Path-specific completion widgets such as `Finish Path` and `Remove Point` stay active when they are part of the current draft flow.
5. General map controls such as `SAT VIEW`, `3D TERRAIN`, `SMOOTH CURVES`, and `Reset View` should be disabled during that authoring lock.

### Motion

1. Pending-layer attention should be visible but restrained.
2. Motion should feel smooth and intentional, not abrupt or noisy.

### Map controls

1. Map-only controls should live together in the sidebar rather than being split between the map canvas and the sidebar.
2. `SAT VIEW` belongs in that section and toggles the satellite basemap on and off.
3. `3D TERRAIN` also belongs in that section and controls terrain exaggeration and map pitch.
4. `Reset View` should be a separate large CTA rather than a small inline row, because it is a one-shot action rather than a persistent mode.
5. Rotation-specific actions such as `North Up` should stay out of the UI until rotation is actually part of the product flow.
6. Drawing-specific options such as path smoothing are not map controls and should not be mixed into the pure map tools cluster.
7. Native-looking map library controls should be replaced with styled product controls when they are visible on top of the map.
8. On-map controls should stay quiet and tool-like; Mondrian accents should be minimal and should never overpower the map or the primary widget controls.
9. The map should try to initialize around the user's current location when the browser allows geolocation.
10. If geolocation is blocked, unsupported, or fails, the map should gracefully fall back to the default home view.
11. A dedicated `Locate Me` control should remain available so the user can re-center the map to their current position later.

### Widgets

1. The `Widgets` control opens a dedicated `Widget Center` panel based on Figma node `1:827`.
2. The `Widget Center` is separate from the pin-edit widget overlay.
3. The initial widget panel should match the floating right-side Figma layout with a close button, `Add Widget` CTA, stacked cards, and a compact `Edit Widgets` footer.
4. The `Zone` mode is temporarily disabled in the main mode switcher until that flow is resumed.
5. If an entity becomes invisible on the map because its layer is hidden or isolated away, its right-side entity panel should close automatically.
6. On desktop, right-side widget surfaces should sit below the top-right control cluster rather than competing with it.
7. Planned entity widgets include:
   - multi-photo gallery
   - markdown stories / notes
   - resource links
   - place rating
   - nearby high-rated pins
   - path transport mode
8. These enrichments should be delivered as separate entity widgets, not as ad-hoc fields inside one giant entity editor.

### Mobile view

1. On mobile, the map stays primary and the left sidebar becomes an off-canvas drawer opened by a dedicated button.
2. The persistent desktop-style right panel should not stay docked on mobile; global widgets and entity widgets should open as bottom sheets instead.
3. If a pending pin or a finalized path needs layer confirmation on mobile, the layers drawer should open automatically so the user can finish saving without hunting for controls.
4. Mobile layout should preserve the same product logic as desktop rather than inventing a separate data flow.
5. Any mobile-only simplification must be documented if it is temporary.

## Maintenance rule

Whenever we change a meaningful product behavior, update this file alongside the implementation.
