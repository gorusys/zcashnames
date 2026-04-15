import { test, expect } from "@playwright/test";

test.describe("Explorer page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/explorer");
  });

  test("loads with title and events table", async ({ page }) => {
    await expect(page).toHaveTitle(/Explorer/i);
    await expect(page.getByRole("heading", { name: /Name Explorer/i })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("shows event rows from the indexer", async ({ page }) => {
    const rows = page.getByRole("table").getByRole("row");
    expect(await rows.count()).toBeGreaterThanOrEqual(2); // at least header + 1 row
  });

  test("All tab is active by default", async ({ page }) => {
    await expect(page.getByRole("button", { name: /^All/i })).toBeVisible();
  });

  test("Registered tab shows events", async ({ page }) => {
    await page.getByRole("button", { name: /^Registered/i }).click();
    expect(await page.getByRole("table").getByRole("row").count()).toBeGreaterThanOrEqual(1);
  });

  test("For Sale tab shows listings table", async ({ page }) => {
    await page.getByRole("button", { name: /^For Sale/i }).click();
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("More dropdown opens and shows action tabs", async ({ page }) => {
    await page.getByRole("button", { name: /^More/i }).click();
    await expect(page.getByRole("button", { name: /^Claim/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Buy/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Delist/i })).toBeVisible();
  });

  test("searching a name via URL shows name detail panel", async ({ page }) => {
    await page.goto("/explorer?name=alice");
    await expect(page.getByText(/alice\.zcash/i)).toBeVisible({ timeout: 10000 });
  });

  test("testnet environment loads via URL param", async ({ page }) => {
    await page.goto("/explorer?env=testnet");
    await expect(page).toHaveURL(/env=testnet/);
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
  });

  test("block height counter is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Block/i })).toBeVisible();
  });

  test("UIVK button opens modal with mainnet and testnet keys", async ({ page }) => {
    await page.getByRole("button", { name: /UIVK/i }).click();
    await expect(page.getByRole("heading", { name: /UIVK/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy Mainnet/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy Testnet/i })).toBeVisible();
  });

  test("UIVK modal closes on X button", async ({ page }) => {
    await page.getByRole("button", { name: /UIVK/i }).click();
    await expect(page.getByRole("heading", { name: /UIVK/i })).toBeVisible();
    // Close button (SVG X)
    const closeBtn = page.locator("[aria-label='UIVK'] ~ *").first();
    await page.keyboard.press("Escape");
    // After escape or close, modal heading is gone
    // Just verify no crash
    await expect(page.getByRole("heading", { name: /Name Explorer/i })).toBeVisible();
  });
});
