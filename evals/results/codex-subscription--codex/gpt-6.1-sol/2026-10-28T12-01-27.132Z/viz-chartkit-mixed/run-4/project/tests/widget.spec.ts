import { test, expect } from "@playwright/test";

test("loads each engine on demand and switches repeatedly without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  await expect(page.locator(".highcharts-root")).toBeVisible();
  expect(requests.some((url) => url.includes("MonitoringChart"))).toBe(false);
  expect(requests.some((url) => /uplot[.\/]/.test(url))).toBe(false);
  await page.getByRole("tab", { name: "Мониторинг" }).click();
  await expect(page.locator(".uplot canvas")).toBeVisible();
  expect(requests.some((url) => url.includes("MonitoringChart"))).toBe(true);
  await expect(
    page.getByText("3 600 измерений", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Увеличить масштаб" }).click();
  await expect(page.locator(".zoom-controls")).toContainText("2×");
  await page.getByRole("button", { name: "Пауза", exact: true }).click();
  await expect(page.getByText("Обновление каждые 5 секунд")).toBeVisible();
  await page.getByRole("tab", { name: "Продажи" }).click();
  await expect(page.locator(".highcharts-root")).toBeVisible();
  await expect(page.locator(".uplot")).toHaveCount(0);
  await page.getByRole("tab", { name: "Мониторинг" }).click();
  await expect(page.locator(".uplot canvas")).toBeVisible();
  expect(errors).toEqual([]);
});

test("filters sales, toggles comparison and exports the selected data", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".highcharts-root")).toBeVisible();
  const original = await page.locator(".metric-value").first().textContent();
  await page.getByRole("button", { name: "1–30 октября 2026" }).click();
  await page.getByRole("button", { name: "Последние 7 дней" }).click();
  await expect(page.locator(".chart-footer")).toContainText("7 точек данных");
  await expect(page.locator(".metric-value").first()).not.toHaveText(original!);
  await page.getByRole("button", { name: "Все каналы", exact: true }).click();
  await page.getByRole("button", { name: "Маркетплейсы", exact: true }).click();
  await expect(page.locator(".filter-button")).toHaveText("Маркетплейсы");
  await expect(page.locator(".highcharts-series")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Предыдущий период", exact: true })
    .click();
  await expect(page.locator(".highcharts-series")).toHaveCount(1);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("pulse-sales-7days.csv");
  await page
    .getByRole("button", { name: "Развернуть график", exact: true })
    .click();
  await expect(page.locator(".chart-card")).toHaveClass(/fullscreen/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".chart-card")).not.toHaveClass(/fullscreen/);
});

test("keeps mobile layout within the viewport and opens navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".highcharts-root")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await page.getByRole("button", { name: "Мониторинг", exact: true }).click();
  await expect(page.locator(".uplot canvas")).toBeVisible();
  await expect(page.locator("h1")).toContainText("Мониторинг системы");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
