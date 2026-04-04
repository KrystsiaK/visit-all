import { expect, type Page } from "@playwright/test";

export const E2E_CREDENTIALS = {
  email: "e2e@visitall.test",
  password: "E2ePassword1!",
} as const;

export async function login(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(E2E_CREDENTIALS.email);
  await page.locator('input[name="password"]').fill(E2E_CREDENTIALS.password);
  await page.getByRole("button", { name: /enter exhibition/i }).click();
  await page.waitForURL("**/");
  await expect(page.getByRole("button", { name: /widgets/i })).toBeVisible();
}
