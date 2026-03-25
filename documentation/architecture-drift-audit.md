# Architecture Drift Audit

## Why this exists

The intended architecture is:

1. one canonical entity container model
2. one shared widget contract
3. one consistent layer visibility model
4. one right-side entity surface for `pin`, `trace`, and `area`

The current codebase is not fully there yet.

This file tracks the most important places where reality still diverges from that target.

## Current assessment

The backend direction is mostly correct.

The frontend interaction model is still partially split by entity type.

That is why some things feel shared in one place and special-cased in another.

## Biggest architecture gaps

### 1. Right-side entity UI is still effectively pin-first

Current reality:

1. `pin` uses [src/components/glass/WidgetOverlay.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/components/glass/WidgetOverlay.tsx)
2. `trace` and `area` still use map editing state in [src/app/page.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx)
3. `trace` / `area` do not yet open the same widget-driven right panel as `pin`

Result:

1. shared backend contract exists
2. shared UI contract does not fully exist yet

### 2. Edit state is still duplicated by entity type

Current reality in [src/app/page.tsx](/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/page.tsx):

1. `editingPinData`
2. `editingTraceId`
3. `editingAreaId`
4. `editingTraceCollectionId`
5. `editingAreaCollectionId`

Result:

1. visibility behavior must be patched separately
2. close/reset behavior must be patched separately
3. autosave and selection rules can drift

Target direction:

1. one `activeEntitySelection`
2. one `entityType`
3. one `entityId`
4. one `entityCollectionId`
5. one `entityOverlayOpen`

### 3. Widget payload is shared, but widget writes are not

Current reality:

1. shared read contract exists in [src/app/actions.ts](/Users/kirylkrystsia/WebstormProjects/visit-all/src/app/actions.ts) via `getEntityWidgetPayload`
2. writes are still split:
3. `updatePinDetails`
4. `updateTrace`
5. `updateArea`

Result:

1. reads feel unified
2. mutations still depend on entity-specific paths

This is acceptable as a transition, but it is not the same as having one true entity-widget write model.

### 4. Layer visibility is shared at map render level, but not fully at interaction level

Current reality:

1. map rendering filters `pin`, `trace`, and `area` by `collection_id`
2. interaction state had to be patched separately for `pin`, then `trace`, then `area`

Result:

1. map data visibility is shared
2. selected/editing entity visibility is not yet driven by one shared controller

### 5. Legacy widget UI has been removed from the codebase

The old `src/components/widgets/WidgetOverlay.tsx` path has been removed.

That reduces mental overhead, but the frontend still has the larger architectural gaps described above.

## What is already architecturally sound

These parts are moving in the right direction:

1. `entity_containers`
2. `widget_definitions`
3. `widget_instances`
4. normalized `WidgetEntityPayload`
5. archive-first delete model
6. global widget layer vs entity widget layer separation

## Most important next refactor

If we want the architecture to stop drifting, the next meaningful step is:

1. replace per-entity frontend edit state with one shared active entity model
2. open the same right-side widget surface for `pin`, `trace`, and `area`
3. let geometry editing be a capability of the active entity flow, not a separate screen model

## Proposed canonical frontend shape

```ts
type ActiveEntitySelection = {
  entityType: "pin" | "trace" | "area";
  entityId: string;
  collectionId: string | null;
  geometryDraft?: { lng: number; lat: number }[];
};
```

Then the page state becomes:

1. `activeEntitySelection`
2. `entityOverlayOpen`
3. `globalWidgetPanelOpen`

instead of multiple parallel edit branches.

## TEMP / Tech Debt

The following should be treated as transitional:

1. `editingPinData`, `editingTraceId`, `editingAreaId`
2. pin-only direct widget editing
3. trace/area edit flows that bypass the same entity widget shell
4. remaining entity-specific edit branches in `page.tsx`
5. TEMP fallback that maps orphan `trace/area` rows to the user's single layer of that type when the row has no direct or container-level `collection_id`

## Decision

For now, we should stop pretending the frontend is fully unified.

More honest statement:

1. backend entity/widget architecture is partially unified
2. frontend entity interaction architecture is still in transition
3. bugs like "works for pin but not for path" are expected until we collapse entity edit state into one model
