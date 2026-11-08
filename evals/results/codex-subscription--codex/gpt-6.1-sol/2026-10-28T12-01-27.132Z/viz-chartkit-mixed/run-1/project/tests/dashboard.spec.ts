import { test, expect } from "@playwright/test";

test("engines load on demand and both visualization modes work", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  expect(requests.some((r) => /SalesEngine.*\.js/.test(r))).toBeTruthy();
  expect(requests.some((r) => /MonitoringEngine.*\.js/.test(r))).toBeFalsy();
  await page.getByRole("tab", { name: "Мониторинг" }).click();
  await expect(page.locator(".uplot canvas")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Мониторинг в реальном времени" }),
  ).toBeVisible();
  expect(requests.some((r) => /MonitoringEngine.*\.js/.test(r))).toBeTruthy();
  await page.getByRole("button", { name: "Приостановить" }).click();
  await expect(page.getByRole("button", { name: "Продолжить" })).toBeVisible();
  await page.getByRole("button", { name: "5 с", exact: true }).click();
  await page.getByRole("tab", { name: "Продажи", exact: true }).click();
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "День", exact: true }),
  ).toHaveClass("active");
  expect(errors).toEqual([]);
  await page.screenshot({ path: "/tmp/pulse-desktop.png", fullPage: true });
});

test("period, legend visibility and CSV export are functional", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "1 — 30 июня 2026" }).click();
  await page
    .getByRole("button", { name: "Последние 7 дней", exact: true })
    .click();
  await expect(page.locator(".engine-label")).toContainText("7 точек");
  await page
    .getByRole("button", { name: "Текущий период", exact: true })
    .click();
  await expect(page.locator(".recharts-area")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Текущий период", exact: true })
    .click();
  await expect(page.locator(".recharts-area")).toHaveCount(1);
  const pendingDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт", exact: true }).click();
  const download = await pendingDownload;
  expect(download.suggestedFilename()).toBe("pulse-sales-2026.csv");
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const contents = Buffer.concat(chunks).toString("utf8");
  expect(contents).toContain("Выручка;Предыдущий период");
  expect(contents.trim().split("\n")).toHaveLength(8);
});

test("sources and workspace controls update the interface", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Источники данных", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Добавить источник", exact: true })
    .click();
  await page.getByLabel("Название источника").fill("Тестовый магазин");
  await page.getByRole("button", { name: "Подключить источник" }).click();
  await expect(page.locator(".source-row")).toHaveCount(4);
  await expect(page.locator(".source-row").last()).toContainText(
    "Тестовый магазин",
  );
  await page.getByRole("button", { name: "Настройки", exact: true }).click();
  await page.getByLabel("Название проекта").fill("Магазин Александра");
  await page.getByRole("button", { name: "Сохранить изменения" }).click();
  await expect(page.locator(".workspace-button")).toContainText(
    "Магазин Александра",
  );
});

test("mobile layout and monitoring fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".recharts-surface").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "/tmp/pulse-mobile.png", fullPage: true });
  await page.getByRole("tab", { name: "Мониторинг" }).click();
  await expect(page.locator(".uplot canvas")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "/tmp/pulse-monitor-mobile.png",
    fullPage: true,
  });
});
