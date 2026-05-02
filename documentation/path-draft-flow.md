# Path Draft Flow Proposal

## Problem

Current `Path` behavior creates and saves too early. It does not feel like a deliberate drafting tool.

## Proposed interaction

### Drafting

1. First click on the map creates the first draft node.
2. Each next click adds a new draft node and extends the draft path.
3. Draft nodes are visible only while the path is still being edited.
4. The node visual should feel precise and premium:
   - small circular marker
   - solid Mondrian center
   - crisp outer ring
   - soft shadow / glow for visibility on map

### Removing nodes

1. Draft nodes must be draggable so the line can be corrected directly on the map.
2. Because drag is the primary interaction, node deletion should use `double click`.
3. If only one node remains and it is removed, the draft path is fully cancelled.

### Finishing the path

## Recommended finish rule

Use an explicit `Finish Path` action instead of hidden gesture logic.

1. When the draft has at least 2 points, show a `Finish Path` action in the sidebar.
2. `Enter` can act as the keyboard shortcut for the same action.
3. After `Finish Path`:
   - the draft becomes a clean final path preview
   - support nodes disappear
   - the system enters a pending layer-selection state, same idea as pending pin
   - the path is not saved yet

### Layer selection after finishing

1. Once the path is finished, the user chooses or creates a layer exactly like the pin flow.
2. If no path layers exist:
   - auto-create a layer titled `undefined`
   - open it in edit mode
   - save the path only after `Done`
3. If the finished draft is cancelled before confirmation, the auto-created layer should also be removed.

## Why this is the best starting point

1. It is predictable.
2. It avoids accidental completion.
3. It matches the explicit layer-confirmation flow already used for pins.
4. It gives us a clean separation:
   - draft path editing
   - finish path
   - confirm layer

## Zone parity

`Zone` should follow the same draft-first contract as `Path`, but with polygon rules.

### Drafting

1. First click creates the first polygon vertex.
2. Each next click adds another vertex.
3. The zone preview stays a draft until the user explicitly finishes it.
4. Draft vertices stay draggable and midpoint handles can still insert new vertices.

### Finishing the zone

1. Use an explicit `Finish Zone` action instead of auto-saving on the third click.
2. `Finish Zone` does not persist the area immediately.
3. After finishing:
   - vertex controls disappear
   - the polygon remains visible as a clean preview
   - layer selection opens the same way as pin/path confirmation
4. The area is saved only after the target layer is confirmed.

### Why parity matters

1. `Path` and `Zone` should feel like the same authoring family.
2. Users should not have to learn one save model for lines and a different one for polygons.
3. Draft-first avoids accidental persistence and makes later editing more deliberate.

## First implementation slice

1. Stop saving traces on the second click.
2. Add draft nodes with last-node deletion.
3. Add `Finish Path` and final preview state.
4. After that, connect the finished draft to the existing layer-confirmation model.

## Design direction

1. The large `Geometry Outline` block is not needed.
2. We only need one explicit completion CTA:
   - `Finish Path`
3. That CTA should sit above the layers area and follow the same family as `New Layer`.
4. Interactions should still feel reliable first:
   - clicking the last draft node again must actually remove it

## Save timing

1. `Finish Path` does not save the trace immediately.
2. Pressing `Finish Path` starts deferred layer-selection flow for the path.
3. The trace is saved only after the layer is confirmed, mirroring the pin flow.
