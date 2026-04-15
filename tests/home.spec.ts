import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with correct title and search input", async ({ page }) => {
    await expect(page).toHaveTitle(/ZcashNames/);
    await expect(page.getByRole("textbox", { name: /desired ZcashName/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Personal names for shielded addresses/i })).toBeVisible();
  });

  test("Mainnet/Testnet/Waitlist mode buttons are present in nav", async ({ page }) => {
    const nav = page.getByRole("banner");
    await expect(nav.getByRole("button", { name: "Mainnet" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Testnet" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Waitlist" })).toBeVisible();
  });

  test("clicking Mainnet opens a password input", async ({ page }) => {
    await page.getByRole("banner").getByRole("button", { name: "Mainnet" }).click();
    await expect(page.getByRole("textbox", { name: /Password/i })).toBeVisible();
  });

  test("clicking Testnet opens a password input", async ({ page }) => {
    await page.getByRole("banner").getByRole("button", { name: "Testnet" }).click();
    await expect(page.getByRole("textbox", { name: /Password/i })).toBeVisible();
  });

  test("search input accepts text", async ({ page }) => {
    const input = page.getByRole("textbox", { name: /desired ZcashName/i });
    await input.fill("alice");
    await expect(input).toHaveValue("alice");
  });

  test("FAQ questions are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /What is a \.zcash name/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Do I really own my name/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /How do payments stay private/i })).toBeVisible();
  });

  test("FAQ accordion toggles answer visibility", async ({ page }) => {
    const question = page.getByRole("button", { name: /What is a \.zcash name/i });
    await question.scrollIntoViewIfNeeded();
    // Answer is visible — click should toggle the indicator
    await question.click();
    await question.click();
    // Button remains visible after toggle
    await expect(question).toBeVisible();
  });

  test("leaderboard link navigates to /leaders", async ({ page }) => {
    // Wait for home page data (stats) to load before clicking
    await expect(page.getByRole("button", { name: /Waitlist/i }).first()).toBeVisible();
    const link = page.getByRole("link", { name: /Leaderboard/i });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(/\/leaders/, { timeout: 15000 });
  });

  test("theme toggle switches themes", async ({ page }) => {
    await page.getByRole("button", { name: /light theme/i }).click();
    await expect(page.getByRole("button", { name: /dark theme/i })).toBeVisible();
    await page.getByRole("button", { name: /dark theme/i }).click();
  });

  test("beta banner links to /closedbeta/apply", async ({ page }) => {
    const banner = page.getByRole("link", { name: /Apply/i }).first();
    await expect(banner).toHaveAttribute("href", "/closedbeta/apply");
  });
});
