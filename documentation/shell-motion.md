# Shell Motion

## Goal

Define what a `shell` is in this product and separate `shell behavior` from `widget behavior`.

This document exists so future UI work can be discussed in terms of:

1. what the shell is responsible for
2. what widgets inside the shell are responsible for
3. how shell motion should feel

## Core definition

A `shell` is the environment in which widgets live.

It is not the widget itself.

A shell is responsible for:

1. placement on screen
2. open / close behavior
3. hide / show behavior
4. docking and alignment
5. dimensions and resizing behavior
6. scroll containment
7. backdrop behavior
8. motion orchestration
9. mobile / desktop adaptation

A shell is not responsible for the business logic of individual widgets.

## Mental model

Use this model:

1. `shell`
   The surface or container.
2. `widget`
   A reusable UI block placed inside a shell.
3. `panel`
   One visual form of a shell.

This means:

1. left sidebar = shell
2. right entity overlay = shell
3. future bottom tray = shell
4. future floating workspace dock = shell

The shell provides the stage.
Widgets perform inside that stage.

## Shell responsibilities

### 1. Spatial responsibility

The shell defines:

1. where it appears
2. from which edge it enters
3. what space it occupies
4. what happens to the rest of the UI while it is open

Examples:

1. left shell docks to the left edge
2. right shell docks to the right edge
3. bottom shell docks to the bottom edge

### 2. Behavioral responsibility

The shell owns:

1. whether it is open
2. whether it is hidden
3. whether it is collapsed
4. whether it is modal or non-modal
5. whether it blocks map interaction

### 3. Motion responsibility

The shell owns the primary movement.

It should control:

1. entrance
2. exit
3. reveal delay
4. hide / show transitions
5. backdrop fade
6. timing for child availability

The shell should feel like one coherent surface.

## Widget responsibilities inside a shell

Widgets should not compete with the shell for attention.

Widgets are responsible for:

1. their own content
2. local interaction
3. local state
4. small internal polish
5. preserving their own layout while data loads

Widgets should not:

1. perform large competing entrance animations while the shell is entering
2. create visible layout jumps that make the shell feel unstable
3. appear in random asynchronous chunks without reserved space

## Motion principles

### 1. Shell first

When a shell appears:

1. the shell should establish itself first
2. then its contents should feel already contained by it

The user should perceive:

1. one surface entering
2. not many separate elements fighting for attention

### 2. No cheap pop-in

The shell should never feel like:

1. frame appears
2. header pops in
3. body appears later
4. cards jump in one by one without structure

Instead:

1. shell establishes position
2. shell settles
3. internal content reveals quietly

### 3. Stable layout

A shell should preserve the feeling of continuity.

That means:

1. reserve space for expected content
2. prefer placeholders or skeletons over late layout shifts
3. avoid dramatic height changes during first load

### 4. Quiet elegance

Target feeling:

1. calm
2. premium
3. fluid
4. deliberate
5. understated

Avoid:

1. bouncy toy-like motion
2. multiple unrelated stagger systems
3. exaggerated hover motion inside a moving shell
4. over-eager opacity/scale combos

## Shell states

Each shell should conceptually support these states:

1. `mounted-hidden`
   Rendered, but not yet visible or intentionally hidden.
2. `entering`
   Moving into place.
3. `settled`
   Fully visible and stable.
4. `active`
   Being interacted with.
5. `hiding`
   Leaving or collapsing.
6. `unmounted`
   Removed from the tree if needed.

Not every shell needs every state in implementation, but this is the conceptual model.

## First-load rule

On first page load:

1. the shell may render off-canvas or at low opacity
2. the page should stabilize
3. then the shell enters as a coherent surface

This is especially important for:

1. left shell
2. right shell

The first-load problem should be solved at the shell level first, not by adding more widget animations.

## Current shells in this product

### Left shell

Purpose:

1. navigation
2. creation flow
3. map mode switching
4. layer management
5. map controls

Contains shell widgets such as:

1. app header
2. search
3. mode switch
4. layer list
5. map controls
6. action cards

### Right shell

Purpose:

1. inspect selected entity
2. edit entity-related information
3. host entity widgets

Contains entity widgets such as:

1. `entity_info`
2. `entity_delete`
3. future media and metadata widgets

## Rules

### 1. Shell entrance waits for layout-ready widgets

The shell should not wait for every async request to finish.

Instead, the shell waits for widgets to reach a `layout-ready` state.

For this product, `layout-ready` means:

1. the widget has mounted
2. the widget has reserved its initial height
3. the widget can render without causing first-load layout jumps
4. it may still continue loading data internally afterward

This keeps the shell premium and calm without making it hostage to slow background work.

### 2. Shell-ready is not data-ready

These are different:

1. `data-ready`
   Every async fetch is complete.
2. `layout-ready`
   The widget can already live inside the shell without destabilizing it.

The shell cares about `layout-ready`.

### 3. Widgets must notify the shell

Each widget inside a shell should explicitly notify the shell when it is ready for shell entrance.

The signal should happen:

1. after initial mount
2. after the widget has established its first stable box
3. before any late content changes would become visually disruptive

### 4. Timeout is mandatory

Shell entrance must never block forever on one widget.

So the runtime should use:

1. required widget readiness
2. a short grace timeout

If a widget fails to report readiness, the shell should still enter after the timeout.

### 5. Shell motion owns the main reveal

When the shell enters:

1. the shell is the star of the moment
2. widgets should already feel contained by it
3. widgets may do only quiet internal polish after the shell is established

1. A shell must own the major entrance and exit behavior.
2. Widgets inside a shell must remain visually subordinate to shell motion.
3. First-load polish should be solved at shell level before tuning widget micro-motion.
4. New shells should reuse the same motion principles even if they dock to different screen edges.
5. The same widget should be able to live in different shells without redefining shell behavior inside the widget itself.

## Next evolution

The next step after this document is:

1. define a shared shell API
2. define shell motion tokens
3. make left and right shells two implementations of the same shell contract
4. keep widget motion as a secondary layer of polish, not the primary source of movement
