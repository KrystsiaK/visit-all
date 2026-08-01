import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GeometryDraftActions } from "@synarava/ui-kit";

describe("GeometryDraftActions", () => {
  it("exposes undo and cancel as separate commands", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    const onCancel = vi.fn();

    render(
      <GeometryDraftActions
        itemLabel="path"
        canUndo
        onUndo={onUndo}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Undo last path point" }));
    await user.click(screen.getByRole("button", { name: "Cancel path drawing" }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables undo when the draft has no reversible point", () => {
    render(
      <GeometryDraftActions
        itemLabel="zone"
        canUndo={false}
        onUndo={() => undefined}
        onCancel={() => undefined}
      />
    );

    expect(screen.getByRole("button", { name: "Undo last zone point" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel zone drawing" })).toBeEnabled();
  });
});
