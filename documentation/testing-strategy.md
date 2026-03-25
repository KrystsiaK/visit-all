# Testing Strategy

## Goal

Create a repeatable safety net for the interaction model we implemented across layers, pins, paths, widgets, and mobile layout.

## Test layers

### 1. Unit tests

Use unit tests for pure decision logic that should not depend on the browser or the map renderer.

Priority unit coverage:

1. map mode to collection type mapping
2. selected layer reordering
3. layer isolation / restore logic
4. mobile drawer auto-open rules for pending entity confirmation

### 2. End-to-end tests

Use browser tests for the flows that matter to users and combine auth, layout, and state transitions.

Priority e2e coverage:

1. demo login works
2. desktop shell loads and exposes the `Widgets` entry point
3. mobile shell exposes the layers drawer trigger
4. mobile drawer opens and closes
5. widget center opens and closes
6. map zoom controls render and can be clicked without crashing the app

## Case inventory

### Layers

1. `New Layer` is always visible
2. empty state does not render an empty layer stack
3. selecting a layer moves it to the top
4. isolating a layer hides the others
5. clicking isolate again restores all layers

### Pins

1. pending pin requires layer confirmation
2. no-layers pin flow auto-creates `undefined`
3. pending pin can be cancelled
4. saved pin opens entity widgets
5. pin title edits are silently saved in the background

### Paths

1. draft nodes accumulate without premature save
2. `Finish Path` is required before layer confirmation
3. path draft layer confirmation follows the same deferred flow as pins

### Widgets

1. global widget center opens from the top control
2. entity widget overlay opens from a pin
3. destructive entity delete flow requires confirmation

### Mobile

1. layers open from a drawer trigger
2. pending layer-confirmation opens the drawer automatically
3. global widgets open as a sheet
4. entity widgets open as a sheet

## TEMP / Tech Debt

1. first test pass focuses on stable shell-level and pure-logic coverage; map drawing and DB-heavy authoring flows still need deeper e2e coverage later
2. pin/path authoring on the map may require dedicated test hooks or seeded fixtures for reliable automation
