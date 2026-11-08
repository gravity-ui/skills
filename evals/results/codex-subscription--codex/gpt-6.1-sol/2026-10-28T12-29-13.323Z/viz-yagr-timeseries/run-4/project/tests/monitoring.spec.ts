import { expect, test } from "@playwright/test";

test("real canvas updates, tooltip, zoom, pause, theme and responsive sizing", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const canvas = page.locator(".cpu-chart canvas");
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("alert")).toHaveCount(0);
  const original = await canvas.elementHandle();
  const updated = page.locator(".chart-footer > span").last();
  const before = await updated.innerText();
  await expect(updated).not.toHaveText(before, { timeout: 5000 });
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);

  const plot = page.locator(".u-over");
  await plot.hover({ position: { x: 120, y: 100 } });
  await expect(page.locator(".yagr-tooltip")).toBeVisible();
  await expect(page.locator(".yagr-tooltip")).toContainText("Загрузка CPU");

  await page.getByRole("button", { name: /Пауза/ }).click();
  const paused = await updated.innerText();
  await page.waitForTimeout(2300);
  await expect(updated).toHaveText(paused);
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(updated).not.toHaveText(paused, { timeout: 5000 });

  const box = (await plot.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.5, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: /Сбросить масштаб/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Сбросить масштаб/ }).click();
  await expect(
    page.getByRole("button", { name: /Сбросить масштаб/ }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "1 час", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "1 час", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Включить тёмную тему" }).click();
  await expect(page.locator(".cpu-chart")).toHaveClass(/yagr_theme_dark/);
  expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  await page.screenshot({
    path: "test-results/monitor-dark.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => canvas.evaluate((node) => node.width))
    .toBeLessThan(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("button", { name: /Пауза/ })).toBeVisible();
  await page.screenshot({
    path: "test-results/monitor-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
