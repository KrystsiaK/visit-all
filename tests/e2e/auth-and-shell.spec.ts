import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("curator@atelier.com").fill("demo@visitall.com");
  await page.getByPlaceholder("••••").fill("demo");
  await page.getByRole("button", { name: /enter exhibition/i }).click();
  await page.waitForURL("**/");
}

test("demo login reaches the main app shell", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("button", { name: /widgets/i })).toBeVisible();
  await expect(page.getByText("Synarava")).toBeVisible();
});

test("widget center opens and closes on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion");
  await login(page);
  await page.getByRole("button", { name: /widgets/i }).click();
  await expect(page.getByText("Widget Center")).toBeVisible();
  await page.getByRole("button", { name: /close widgets/i }).click();
  await expect(page.getByText("Widget Center")).not.toBeVisible();
});

test("map zoom controls render and can be clicked", async ({ page }) => {
  await login(page);
  const zoomIn = page.getByRole("button", { name: /zoom in/i });
  const zoomOut = page.getByRole("button", { name: /zoom out/i });

  await expect(zoomIn).toBeVisible();
  await expect(zoomOut).toBeVisible();

  await zoomIn.click();
  await zoomOut.click();
  await expect(zoomIn).toBeVisible();
});

test("show only activates from a visible layer without muting it", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion");
  await login(page);

  const layerCard = page.getByTestId("layer-card").first();
  const eyeButton = layerCard.getByTestId("layer-mute-button");
  const soloButton = layerCard.getByTestId("layer-solo-button");

  await expect(eyeButton).toBeVisible();
  await expect(soloButton).toBeVisible();
  await expect(eyeButton).toHaveAttribute("aria-pressed", "false");
  await expect(soloButton).toHaveAttribute("aria-pressed", "false");

  await soloButton.click();

  await expect(soloButton).toHaveAttribute("aria-pressed", "true");
  await expect(eyeButton).toHaveAttribute("aria-pressed", "false");
});

test("show only unmutes the same layer when activated after eye off", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion");
  await login(page);

  const layerCard = page.getByTestId("layer-card").first();
  const eyeButton = layerCard.getByTestId("layer-mute-button");
  const soloButton = layerCard.getByTestId("layer-solo-button");

  await eyeButton.click();
  await expect(eyeButton).toHaveAttribute("aria-pressed", "true");

  await soloButton.click();

  await expect(soloButton).toHaveAttribute("aria-pressed", "true");
  await expect(eyeButton).toHaveAttribute("aria-pressed", "false");
});
