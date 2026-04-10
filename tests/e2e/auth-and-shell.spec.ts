import { expect, test } from "@playwright/test";
import { login } from "./helpers/auth";

test("e2e login reaches the main app shell", async ({ page, isMobile }) => {
  await login(page);
  await expect(page.getByRole("button", { name: /widgets/i })).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: isMobile ? /layers drawer/i : /layers panel/i,
    })
  ).toBeVisible();
});

test("widget center opens and closes on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion");
  await login(page);
  await page.getByRole("button", { name: /widgets/i }).click();
  const widgetCenterHero = page.getByTestId("widget-center-hero");
  await expect(widgetCenterHero).toBeVisible();
  await widgetCenterHero.getByRole("button", { name: /close widgets/i }).click();
  await expect(widgetCenterHero).not.toBeVisible();
});

test("right entity shell closes when clicking outside the panel on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion");
  await login(page);

  const openShellPin = page.getByTestId("e2e-open-shell-pin");
  await openShellPin.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });

  const pinnedHero = page.getByTestId("entity-pinned-hero");
  await expect(pinnedHero).toBeVisible();

  await page.getByRole("button", { name: /dismiss entity drawer overlay/i }).click();

  await expect(pinnedHero).not.toBeVisible();
});

test("user shell uses the same top inset and closes on outside click on desktop", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop-only assertion");
  await login(page);

  await page.getByTestId("open-user-shell").click();

  const userHero = page.getByTestId("user-shell-hero");
  await expect(userHero).toBeVisible();

  const heroBox = await userHero.boundingBox();
  expect(heroBox).not.toBeNull();
  expect(heroBox!.y).toBeGreaterThanOrEqual(24);

  await page.getByRole("button", { name: /close account shell/i }).first().click();
  await expect(userHero).not.toBeVisible();
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

  const collectionCard = page.getByTestId("collection-card").first();
  const eyeButton = collectionCard.getByTestId("collection-mute-button");
  const soloButton = collectionCard.getByTestId("collection-solo-button");

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

  const collectionCard = page.getByTestId("collection-card").first();
  const eyeButton = collectionCard.getByTestId("collection-mute-button");
  const soloButton = collectionCard.getByTestId("collection-solo-button");

  await eyeButton.click();
  await expect(eyeButton).toHaveAttribute("aria-pressed", "true");

  await soloButton.click();

  await expect(soloButton).toHaveAttribute("aria-pressed", "true");
  await expect(eyeButton).toHaveAttribute("aria-pressed", "false");
});
