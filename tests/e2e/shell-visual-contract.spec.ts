import { expect, test } from "@playwright/test";

import { login } from "./helpers/auth";

async function ensureLeftSidebarOpen(page: import("@playwright/test").Page) {
  const searchWidget = page.getByTestId("shell-search-widget");

  if (await searchWidget.count()) {
    return searchWidget;
  }

  const topHero = page.locator('[data-testid="top-chrome-hero"]:visible').first();
  const toggleButton = page.locator('button:visible:has([data-testid="top-chrome-hero"])').first();
  await expect(topHero).toBeVisible();
  await toggleButton.click();
  await expect(searchWidget).toBeVisible();

  return searchWidget;
}

test.describe("shell visual contract", () => {
  test("left shell hero keeps the same top anchor when toggling closed and open on desktop", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop-only shell geometry assertion");
    await login(page);

    const leftHero = page.locator('[data-testid="top-chrome-hero"]:visible').first();
    await expect(leftHero).toBeVisible();

    const closedHeroBox = await leftHero.boundingBox();
    expect(closedHeroBox).not.toBeNull();

    await page.locator('button:visible:has([data-testid="top-chrome-hero"])').first().click();
    await expect(leftHero).toBeVisible();

    const openHeroBox = await leftHero.boundingBox();
    expect(openHeroBox).not.toBeNull();

    expect(Math.abs(closedHeroBox!.y - openHeroBox!.y)).toBeLessThanOrEqual(2);
  });

  test("left shell keeps the first widget below the top hero without overlap", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop-only shell geometry assertion");
    await login(page);

    const topHero = page.locator('[data-testid="top-chrome-hero"]:visible').first();
    const searchWidget = await ensureLeftSidebarOpen(page);

    await expect(topHero).toBeVisible();

    const heroBox = await topHero.boundingBox();
    const searchBox = await searchWidget.boundingBox();

    expect(heroBox).not.toBeNull();
    expect(searchBox).not.toBeNull();

    expect(searchBox!.y).toBeGreaterThanOrEqual(heroBox!.y + heroBox!.height + 24);
  });

  test("right shell keeps the first entity widget below the pinned hero without overlap", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop-only shell geometry assertion");
    await login(page);

    const openShellPin = page.getByTestId("e2e-open-shell-pin");
    await openShellPin.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });

    const pinnedHero = page.getByTestId("entity-pinned-hero");
    const firstMainWidget = page.getByTestId("entity-rating-widget");

    await expect(pinnedHero).toBeVisible();
    await expect(firstMainWidget).toBeVisible();

    const heroBox = await pinnedHero.boundingBox();
    const firstMainWidgetBox = await firstMainWidget.boundingBox();

    expect(heroBox).not.toBeNull();
    expect(firstMainWidgetBox).not.toBeNull();

    expect(heroBox!.y).toBeGreaterThanOrEqual(24);
    expect(firstMainWidgetBox!.y).toBeGreaterThanOrEqual(heroBox!.y + heroBox!.height + 24);
  });

  test("left and right shell pinned layout uses the same vertical rhythm", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop-only shell geometry assertion");
    await login(page);

    const topHero = page.locator('[data-testid="top-chrome-hero"]:visible').first();
    const searchWidget = await ensureLeftSidebarOpen(page);

    const openShellPin = page.getByTestId("e2e-open-shell-pin");
    await openShellPin.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });

    const rightHero = page.getByTestId("entity-pinned-hero");
    const rightFirstWidget = page.getByTestId("entity-rating-widget");

    await expect(topHero).toBeVisible();
    await expect(rightHero).toBeVisible();
    await expect(rightFirstWidget).toBeVisible();

    const leftHeroBox = await topHero.boundingBox();
    const leftFirstBox = await searchWidget.boundingBox();
    const rightHeroBox = await rightHero.boundingBox();
    const rightFirstBox = await rightFirstWidget.boundingBox();

    expect(leftHeroBox).not.toBeNull();
    expect(leftFirstBox).not.toBeNull();
    expect(rightHeroBox).not.toBeNull();
    expect(rightFirstBox).not.toBeNull();

    const leftGapFromTop = leftHeroBox!.y;
    const rightGapFromTop = rightHeroBox!.y;
    const leftGapAfterPinned = leftFirstBox!.y - (leftHeroBox!.y + leftHeroBox!.height);
    const rightGapAfterPinned = rightFirstBox!.y - (rightHeroBox!.y + rightHeroBox!.height);

    expect(Math.abs(leftGapFromTop - rightGapFromTop)).toBeLessThanOrEqual(2);
    expect(Math.abs(leftGapAfterPinned - rightGapAfterPinned)).toBeLessThanOrEqual(2);
  });
});
