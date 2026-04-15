import { test, expect } from "@playwright/test";

test.describe("Leaders / Leaderboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/leaders");
  });

  test("loads and shows leaderboard table with rows", async ({ page }) => {
    const table = page.getByRole("table").first();
    await expect(table).toBeVisible();
    expect(await table.getByRole("row").count()).toBeGreaterThanOrEqual(2);
  });

  test("table headers include Rank, ZcashName, Refs, Rewards", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Rank" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "ZcashName" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Refs" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Rewards" })).toBeVisible();
  });

  test("has a Back to Home link that navigates to /", async ({ page }) => {
    // Wait for leaderboard data to finish loading before navigating away
    await expect(page.getByRole("table").first()).toBeVisible();
    const link = page.getByRole("link", { name: /Back to Home/i });
    await link.click();
    await expect(page).toHaveURL("/", { timeout: 15000 });
  });

  test("Waitlist/Referred/Rewards stat buttons are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Waitlist/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Referred/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Rewards/i }).first()).toBeVisible();
  });

  test("Daily Rankings section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Daily Rankings/i })).toBeVisible();
  });

  test("How the Leaderboard Works accordion is present", async ({ page }) => {
    const accordion = page.getByRole("button", { name: /How the Leaderboard Works/i });
    await accordion.scrollIntoViewIfNeeded();
    await expect(accordion).toBeVisible();
    await accordion.click();
    // Expand text changes or Referrals/Ranking headings become visible
    await expect(page.getByRole("heading", { name: /Referrals/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ranking", exact: true })).toBeVisible();
  });
});
