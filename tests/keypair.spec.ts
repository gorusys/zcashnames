import { test, expect } from "@playwright/test";

test.describe("Keypair tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/keypair");
  });

  test("loads with correct heading and instructions", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Keypair Tool/i })).toBeVisible();
    await expect(page.getByText(/Generate or import an Ed25519 keypair/i)).toBeVisible();
  });

  test("shows Generate and Use Existing buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Generate New Keypair/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Use Existing Keypair/i })).toBeVisible();
  });

  test("private key import field is visible", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: /Private key/i })).toBeVisible();
  });

  test("Generate New Keypair reveals sign section", async ({ page }) => {
    await page.getByRole("button", { name: /Generate New Keypair/i }).click();
    await expect(page.getByRole("heading", { name: /Sign a payload/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign Payload/i })).toBeVisible();
  });

  test("Generate New Keypair shows Start Over button", async ({ page }) => {
    await page.getByRole("button", { name: /Generate New Keypair/i }).click();
    await expect(page.getByRole("button", { name: /Start over/i })).toBeVisible();
  });

  test("signing a payload produces a result", async ({ page }) => {
    await page.getByRole("button", { name: /Generate New Keypair/i }).click();
    // Wait for sign section to render before interacting
    await expect(page.getByRole("heading", { name: /Sign a payload/i })).toBeVisible();
    const payloadInput = page.getByRole("textbox", { name: /sovereign payload/i });
    await payloadInput.fill("test-payload");
    await page.getByRole("button", { name: /Sign Payload/i }).click();
    // Should show the signed payload output section
    await expect(page.getByText("Signature (base64)")).toBeVisible({ timeout: 10000 });
  });

  test("Start Over resets the tool", async ({ page }) => {
    await page.getByRole("button", { name: /Generate New Keypair/i }).click();
    const startOver = page.getByRole("button", { name: /Start over/i });
    await expect(startOver).toBeVisible();
    await startOver.click();
    // Sign section should be gone
    await expect(page.getByRole("heading", { name: /Sign a payload/i })).not.toBeVisible();
  });
});
