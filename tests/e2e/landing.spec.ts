import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders the hero and key sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /start learning/i }).first()).toHaveAttribute(
      "href",
      "/learn",
    );

    for (const id of ["#how", "#features", "#games"]) {
      await expect(page.locator(id)).toBeAttached();
    }
  });

  test("reveals a word in the reading moment", async ({ page }) => {
    await page.goto("/");
    const card = page.getByRole("button", { name: /reveal/i }).first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "true");
  });
});
