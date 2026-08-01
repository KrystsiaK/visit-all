# Map Path Routing

## User modes

Path drawing keeps the canonical map interaction mode `trace` and adds a routing strategy:

1. `direct` preserves the original straight-segment behavior.
2. `pedestrian` follows the OpenStreetMap pedestrian network between user anchors.

The strategy is selected by the PATHS widget through wiring-engine signals. Widgets do not import map-domain state directly.

## Geometry model

Pedestrian drafts keep two representations:

1. `traceAnchors` contains only points explicitly placed or dragged by the user.
2. `drawingPath` contains the complete routed geometry rendered and persisted as GeoJSON.

This prevents routing responses with hundreds of coordinates from creating hundreds of draggable markers. Moving an anchor recalculates the affected route through the routing service.

## Provider boundary

The browser calls `POST /api/map/route`. The route handler authenticates the request and normalizes provider output to `MapCoordinate[]`.

The development default is the public FOSSGIS Valhalla endpoint with pedestrian costing. Production can use a self-hosted Valhalla instance by setting:

```env
VALHALLA_BASE_URL=https://routing.example.com
```

Provider-specific response shapes must remain inside the route handler. Map components and widgets consume only the normalized application contract.

## Failure behavior

If routing is unavailable, the client keeps the draft usable with a direct segment. The existing direct mode remains independent from the routing provider.

## Draft history and cancellation

The geometry editor owns two draft commands:

1. `undoDraft` removes the latest user anchor. In pedestrian mode the routed geometry is rebuilt from the remaining anchors.
2. `cancelDraft` clears the complete unsaved geometry, routing request, branch attachment, and finalized-selection state.

The map-mode context exposes these commands to shell widgets. `@synarava/ui-kit` supplies the visual `GeometryDraftActions` control, but contains no map-domain state. `Cmd/Ctrl+Z` invokes undo and `Escape` invokes cancellation through the same editor commands used by the buttons.

## Persistence

The original path remains in `traces.path` as a `LineString`. Routed paths use the same representation, so their persistence is unchanged.

## Branched paths

A path entity can also form a network. Its original line remains the canonical segment, while additional segments are stored in `trace_branches` and reference the same `traces.id`.

Clicking any rendered segment in PATHS mode snaps the attachment to the nearest point on that segment. The draft can start from that point or end there. The server validates and re-snaps the attachment against the complete owned network before inserting the branch.

The map flattens the canonical line and all branches into separate GeoJSON features with the same path id. This keeps selection, collection visibility, styling, and entity widgets attached to one path while allowing multiple free endpoints and branches from earlier branches.
