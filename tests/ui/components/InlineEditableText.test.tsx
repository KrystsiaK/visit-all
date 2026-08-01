import { useState, type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InlineEditableText } from "@synarava/ui-kit";

interface HarnessProps {
  initialValue?: string;
  placeholder?: string;
  emptyFallback?: string;
  editable?: boolean;
  disabled?: boolean;
  onCommit?: (value: string) => void | Promise<void>;
}

function InlineEditableTextHarness({
  initialValue = "",
  placeholder,
  emptyFallback,
  editable = true,
  disabled = false,
  onCommit,
}: HarnessProps): ReactElement {
  const [value, setValue] = useState(initialValue);

  return (
    <InlineEditableText
      value={value}
      placeholder={placeholder}
      emptyFallback={emptyFallback}
      editable={editable}
      disabled={disabled}
      onChange={setValue}
      onCommit={() => onCommit?.(value)}
    />
  );
}

describe("InlineEditableText", () => {
  it("renders a textbox in editable mode", () => {
    render(<InlineEditableTextHarness initialValue="Untitled Marker" />);

    expect(screen.getByRole("textbox")).toHaveValue("Untitled Marker");
  });

  it("renders read-only text with fallback when editing is disabled", () => {
    render(
      <InlineEditableTextHarness
        initialValue=""
        editable={false}
        emptyFallback="Untitled Marker"
      />
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Untitled Marker")).toBeInTheDocument();
  });

  it("shows placeholder text while the editable input is empty", () => {
    render(<InlineEditableTextHarness initialValue="" placeholder="Enter a title" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "Enter a title");
  });

  it("updates the visible value while typing without committing", async () => {
    const user = userEvent.setup();
    const handleCommit = vi.fn();

    render(<InlineEditableTextHarness initialValue="Pin" onCommit={handleCommit} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.type(input, " name");

    expect(input).toHaveValue("Pin name");
    expect(input).toHaveFocus();
    expect(handleCommit).not.toHaveBeenCalled();
  });

  it("commits once on blur using the latest edited value", async () => {
    const user = userEvent.setup();
    const handleCommit = vi.fn();

    render(
      <div>
        <InlineEditableTextHarness initialValue="Pin" onCommit={handleCommit} />
        <button type="button">Outside</button>
      </div>
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{End} title");

    expect(input).toHaveValue("Pin title");
    expect(handleCommit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(handleCommit).toHaveBeenCalledTimes(1);
    expect(handleCommit).toHaveBeenCalledWith("Pin title");
  });

  it("commits once on Enter and removes focus from the input", async () => {
    const user = userEvent.setup();
    const handleCommit = vi.fn();

    render(
      <div>
        <InlineEditableTextHarness initialValue="Pin" onCommit={handleCommit} />
        <button type="button">Outside</button>
      </div>
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{End} title{Enter}");

    expect(handleCommit).toHaveBeenCalledTimes(1);
    expect(handleCommit).toHaveBeenCalledWith("Pin title");
    expect(input).not.toHaveFocus();
  });

  it("commits once when the user tabs away", async () => {
    const user = userEvent.setup();
    const handleCommit = vi.fn();

    render(
      <div>
        <InlineEditableTextHarness initialValue="Pin" onCommit={handleCommit} />
        <button type="button">Outside</button>
      </div>
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{End} title");
    await user.tab();

    expect(handleCommit).toHaveBeenCalledTimes(1);
    expect(handleCommit).toHaveBeenCalledWith("Pin title");
  });

  it("does not allow editing when disabled", async () => {
    const user = userEvent.setup();
    const handleCommit = vi.fn();

    render(<InlineEditableTextHarness initialValue="Pinned" disabled onCommit={handleCommit} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();

    await user.click(input);
    await user.type(input, " title");

    expect(input).toHaveValue("Pinned");
    expect(handleCommit).not.toHaveBeenCalled();
  });
});
