import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("curator@atelier.com").fill("demo@visitall.com");
  await page.getByPlaceholder("••••").fill("demo");
  await page.getByRole("button", { name: /enter exhibition/i }).click();
  await page.waitForURL("**/");
}

test("mobile shell exposes the layers drawer", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only assertion");
  await login(page);
  const drawerTrigger = page.getByRole("button", { name: /open layers drawer/i });
  await expect(drawerTrigger).toBeVisible();
  await drawerTrigger.click();
  await expect(page.getByRole("button", { name: /new layer/i })).toBeVisible();
});

test("mobile widget center opens as a sheet", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only assertion");
  await login(page);
  await page.getByRole("button", { name: /widgets/i }).click();
  await expect(page.getByText("Widget Center")).toBeVisible();
  await page.locator('button[aria-label="Close widgets"]').nth(1).click();
  await expect(page.getByText("Widget Center")).not.toBeVisible();
});
