import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BaseWidget } from "../../src";

describe("BaseWidget", () => {
  it("shows background options inside settings and emits the selected style", async () => {
    const user = userEvent.setup();
    const handleBackgroundChange = vi.fn();

    render(
      <div className="w-[420px]">
        <BaseWidget
          title="Entity Sources"
          subtitle="External references connected to this pin."
          backgroundStyle="default"
          onBackgroundStyleChange={handleBackgroundChange}
        >
          <div>Body</div>
        </BaseWidget>
      </div>
    );

    await user.click(screen.getByRole("button", { name: "Edit widget settings" }));
    await user.click(screen.getByRole("button", { name: "Mist" }));

    expect(handleBackgroundChange).toHaveBeenCalledTimes(1);
    expect(handleBackgroundChange).toHaveBeenCalledWith("mist");
  });

  it("supports expanded mode without applying the compact max-height clamp", () => {
    render(
      <div className="w-[420px]">
        <BaseWidget title="Expanded Widget" sizeMode="expanded">
          <div>Body</div>
        </BaseWidget>
      </div>
    );

    const chrome = screen.getByText("Body").closest("[data-testid]") ?? screen.getByText("Body").closest(".group");
    expect(chrome?.className).not.toContain("max-h-[min(560px,68vh)]");
  });
});

