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
