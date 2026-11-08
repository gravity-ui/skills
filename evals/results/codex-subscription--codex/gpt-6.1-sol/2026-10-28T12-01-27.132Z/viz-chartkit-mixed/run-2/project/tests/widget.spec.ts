import { test, expect } from "@playwright/test";

test("loads engines on demand, switches modes and keeps shared controls", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".chart-canvas svg")).toBeVisible();
  expect(requests.some((url) => /GravityChartsWidget.*\.js/.test(url))).toBe(
    true,
  );
  expect(requests.some((url) => /YagrWidget.*\.js/.test(url))).toBe(false);
  await page.getByRole("button", { name: "Неделя", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Неделя", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("tab", { name: "Мониторинг" }).click();
  await expect(page.locator(".chart-canvas canvas")).toBeVisible();
  expect(requests.some((url) => /YagrWidget.*\.js/.test(url))).toBe(true);
  await expect(
    page.getByRole("button", { name: "Неделя", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Пауза", exact: true }).click();
  await expect(page.getByRole("button", { name: "Продолжить" })).toBeVisible();
  await page.getByLabel("Сравнить с прошлым периодом").uncheck();
  await expect(page.locator(".legend")).not.toContainText("Предыдущий период");
  await page.getByRole("tab", { name: "Продажи" }).click();
  await expect(page.locator(".chart-canvas svg")).toBeVisible();
  await expect(
    page.getByLabel("Сравнить с прошлым периодом"),
  ).not.toBeChecked();
  expect(errors).toEqual([]);
});

test("exports the active mode and period as CSV", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Неделя", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("pulse-sales.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const csv = Buffer.concat(chunks).toString("utf8");
  expect(csv).toContain("Продажи (₽)");
  expect(csv.trim().split("\n")).toHaveLength(8);
});

test("fits mobile and supports expanding the chart", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".chart-canvas svg")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Развернуть график" }).click();
  await expect(page.locator(".chart-card")).toHaveClass(/expanded/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".chart-card")).not.toHaveClass(/expanded/);
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/mobile-open/);
  await page
    .locator(".favorites")
    .getByRole("button", { name: "Мониторинг" })
    .click();
  await expect(page.locator(".chart-canvas canvas")).toBeVisible();
  await expect(page.locator(".sidebar")).not.toHaveClass(/mobile-open/);
});

test("updates monitoring data and freezes it when paused", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.getByRole("tab", { name: "Мониторинг" }).click();
  const canvas = page.locator(".chart-canvas canvas");
  await expect(canvas).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const initial = await canvas.evaluate((el: HTMLCanvasElement) =>
    el.toDataURL(),
  );
  await page.clock.fastForward(4100);
  await expect
    .poll(() => canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL()))
    .not.toBe(initial);
  await page.getByRole("button", { name: "Пауза", exact: true }).click();
  const paused = await canvas.evaluate((el: HTMLCanvasElement) =>
    el.toDataURL(),
  );
  await page.clock.fastForward(8100);
  expect(await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())).toBe(
    paused,
  );
  await page.getByRole("button", { name: "Продолжить" }).click();
  await page.clock.fastForward(4100);
  await expect
    .poll(() => canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL()))
    .not.toBe(paused);
});
