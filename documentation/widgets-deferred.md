# Widgets Deferred State

## Current decision

Widgets remain visible and openable in the UI.

However, interactive widget authoring is temporarily disabled for this iteration.

## Why

The widget foundation is useful, but the authoring flows are not yet reliable enough to present as a production-ready interaction model.

To avoid misleading users, we keep:

1. widget visibility
2. widget layout
3. widget architecture direction

and temporarily disable:

1. widget editing
2. widget add flows
3. widget destructive flows
4. widget detail actions

## Scope of the defer

Current deferred actions:

1. entity title editing from the widget shell
2. curator note editing
3. image upload / delete from widget UI
4. entity delete widget action
5. global `Add Widget`
6. global widget `View Details`

## TEMP / Tech Debt

This is a temporary product decision for stability.

When widget work resumes, the next iteration should re-enable actions only after:

1. one shared active entity flow exists
2. one consistent widget write model exists
3. upload flow is stable
4. entity widget actions are covered by tests
