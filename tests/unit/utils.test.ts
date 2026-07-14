import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes, last wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-ink", false, undefined, "font-bold")).toBe("text-ink font-bold");
  });
});
