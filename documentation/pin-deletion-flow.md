# Pin Deletion Flow

## Goal

Provide a clear deletion path for both unsaved and saved pins.

## Required behavior

1. If the user has placed a pending pin but has not confirmed a layer yet, clicking that same pending pin again should cancel it.
2. If the pin is already saved, deletion should happen from the widget overlay, since that is the contextual editor the user opens for an existing pin.
3. The saved-pin delete action should remain explicit and destructive.
4. Cancelling a pending pin must not affect existing pins or layer ordering.

## Implementation notes

1. Keep the pending pin visible on the map until confirmation or cancellation.
2. Add a click handler to the pending pin marker that clears the draft pin state.
3. Keep the widget overlay delete action wired to the existing server delete action.
4. Verify both flows with a build and manual runtime checks.
