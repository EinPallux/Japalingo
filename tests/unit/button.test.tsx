import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders a native button by default", () => {
    render(<Button>Go</Button>);
    const el = screen.getByRole("button", { name: "Go" });
    expect(el.tagName).toBe("BUTTON");
    expect(el.className).toContain("btn-chunky");
  });

  it("renders an anchor when href is provided", () => {
    render(<Button href="/learn">Start</Button>);
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/learn");
  });

  it("applies the requested variant", () => {
    render(<Button variant="secondary">Hi</Button>);
    expect(screen.getByRole("button", { name: "Hi" }).className).toContain("bg-secondary");
  });
});
