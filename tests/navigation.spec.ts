import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("logo on home page links to /", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "ZcashNames" }).first()).toHaveAttribute("href", "/");
  });

  test("logo on explorer links to /", async ({ page }) => {
    await page.goto("/explorer");
    await expect(page.getByRole("link", { name: "ZcashNames" }).first()).toHaveAttribute("href", "/");
  });

  test("logo on keypair links to /", async ({ page }) => {
    await page.goto("/keypair");
    await expect(page.getByRole("link", { name: "ZcashNames" }).first()).toHaveAttribute("href", "/");
  });

  test("logo on leaders links to /", async ({ page }) => {
    await page.goto("/leaders");
    await expect(page.getByRole("link", { name: "ZcashNames" }).first()).toHaveAttribute("href", "/");
  });

  test("footer social links are present on home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /X \/ Twitter/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Discord/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Telegram/i })).toBeVisible();
  });

  test("/closedbeta loads without error", async ({ page }) => {
    await page.goto("/closedbeta");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("/docs loads without error", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByRole("main")).toBeVisible();
  });
});
