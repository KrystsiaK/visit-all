# Mobile View Plan

## Goal

Ship a fast mobile version without splitting product logic from desktop.

## Decisions

1. The map remains the main canvas.
2. The left control surface becomes a drawer on small screens.
3. The desktop right-side widget surfaces become mobile bottom sheets.
4. Layer selection for pending entities should auto-open the drawer on mobile.
5. Clicking a pin on mobile still opens its entity widgets automatically, but in a sheet instead of a docked side panel.

## Layer flow on mobile

1. Place a pin or finish a path draft.
2. If layer confirmation is needed, open the drawer automatically.
3. Confirm an existing layer or create a new one.
4. After confirmation, close the drawer so the map is visible again.

## TEMP / Tech Debt

1. Mobile uses the same desktop widget cards inside a sheet. This is acceptable for the first pass but may need denser card variants later.
2. Global widgets and entity widgets still share some desktop spacing values; revisit if the mobile sheet feels too airy after QA.
