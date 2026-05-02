import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { StarRatingInput } from "@/components/inputs/StarRatingInput";

describe("StarRatingInput", () => {
  it("renders five radio buttons in interactive mode", () => {
    render(<StarRatingInput value={null} onChange={vi.fn()} />);

    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("calls onChange with the selected value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<StarRatingInput value={null} onChange={handleChange} />);

    await user.click(screen.getByRole("radio", { name: "Rate 4 stars" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("marks the selected value as checked", () => {
    render(<StarRatingInput value={3} onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Rate 3 stars" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Rate 2 stars" })).toHaveAttribute("aria-checked", "false");
  });

  it("disables interaction when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<StarRatingInput value={4} disabled onChange={handleChange} />);

    const target = screen.getByRole("radio", { name: "Rate 5 stars" });
    expect(target).toBeDisabled();

    await user.click(target);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("renders read-only stars without radios", () => {
    render(<StarRatingInput value={4} readOnly />);

    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Rating: 4 out of 5" })).toBeInTheDocument();
  });
});
