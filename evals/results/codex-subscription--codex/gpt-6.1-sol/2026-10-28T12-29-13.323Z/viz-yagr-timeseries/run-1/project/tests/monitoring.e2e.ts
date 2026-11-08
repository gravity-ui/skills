import { test, expect } from "@playwright/test";

const pageErrors = new WeakMap<object, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".cpu-chart canvas")).toHaveCount(1);
  // Yagr publishes its constructor on window. Capture the instance without
  // adding test-only hooks to the production component.
  await page.evaluate(() => {
    const w = window as any;
    const original = w.Yagr.prototype.setSeries;
    w.Yagr.prototype.setSeries = function (...args: any[]) {
      w.cpuInstance = this;
      return original.apply(this, args);
    };
    w.firstCanvas = document.querySelector(".cpu-chart canvas");
  });
  await page.waitForFunction(() => Boolean((window as any).cpuInstance));
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

test("streams a bounded day on the same canvas; supports hover and theme changes", async ({
  page,
}) => {
  await page.waitForTimeout(2300);
  expect(
    await page.evaluate(() => {
      const w = window as any;
      return {
        sameCanvas:
          w.firstCanvas === document.querySelector(".cpu-chart canvas"),
        count: w.cpuInstance.config.timeline.length,
        range:
          w.cpuInstance.uplot.scales.x.max - w.cpuInstance.uplot.scales.x.min,
      };
    }),
  ).toEqual({ sameCanvas: true, count: 43201, range: 86_400_000 });

  const plot = await page.locator(".u-over").boundingBox();
  await page.mouse.move(plot!.x + plot!.width / 2, plot!.y + plot!.height / 2);
  await expect(page.locator(".yagr-tooltip")).toBeVisible();
  await expect(page.locator(".yagr-tooltip")).toContainText("Загрузка CPU");
  await page.getByRole("button", { name: "Включить тёмную тему" }).click();
  await expect(page.locator(".cpu-chart")).toHaveClass(/yagr_theme_dark/);
  expect(
    await page.evaluate(
      () =>
        (window as any).firstCanvas ===
        document.querySelector(".cpu-chart canvas"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Включить светлую тему" }).click();
  await expect(page.locator(".cpu-chart")).toHaveClass(/yagr_theme_light/);
});

test("changes ranges, preserves a selected zoom during streaming, and resets it", async ({
  page,
}) => {
  await page.getByRole("button", { name: "1 ч", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const { min, max } = (window as any).cpuInstance.uplot.scales.x;
        return max - min;
      }),
    )
    .toBe(3_600_000);
  const plot = (await page.locator(".u-over").boundingBox())!;
  await page.mouse.move(plot.x + plot.width * 0.2, plot.y + 60);
  await page.mouse.down();
  await page.mouse.move(plot.x + plot.width * 0.6, plot.y + 60, { steps: 12 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Сбросить масштаб" }),
  ).toBeEnabled();
  const zoom = await page.evaluate(() => {
    const { min, max } = (window as any).cpuInstance.uplot.scales.x;
    return { min, max };
  });
  expect(zoom.max - zoom.min).toBeLessThan(3_600_000);
  await page.waitForTimeout(2300);
  expect(
    await page.evaluate(() => {
      const { min, max } = (window as any).cpuInstance.uplot.scales.x;
      return { min, max };
    }),
  ).toEqual(zoom);
  await page.getByRole("button", { name: "Сбросить масштаб" }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const { min, max } = (window as any).cpuInstance.uplot.scales.x;
        return max - min;
      }),
    )
    .toBe(3_600_000);
});

test("pauses, switches host, toggles visibility, and exports the selected period", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Приостановить обновление" }).click();
  const stamp = await page.locator(".chart-status").innerText();
  await page.waitForTimeout(2300);
  expect(await page.locator(".chart-status").innerText()).toBe(stamp);
  await page
    .getByRole("combobox", { name: "Выбрать сервер" })
    .selectOption("worker-01");
  await expect(page.locator(".hardware-card .metric-value")).toHaveText(
    "16vCPU",
  );
  await page.getByRole("checkbox", { name: "Показать загрузку CPU" }).uncheck();
  await expect
    .poll(() =>
      page.evaluate(() => (window as any).cpuInstance.uplot.series[1].show),
    )
    .toBe(false);
  await page.getByRole("checkbox", { name: "Показать загрузку CPU" }).check();
  await page.getByRole("button", { name: "6 ч", exact: true }).click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Экспорт данных" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("worker-01-cpu-6h.csv");
  await expect(
    page.getByRole("button", { name: "CSV сохранён" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Продолжить обновление" }).click();
  await expect(page.locator(".live-badge")).toHaveText("LIVE");
});

test("fits desktop and mobile containers without horizontal overflow", async ({
  page,
}) => {
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const chart = document.querySelector(".cpu-chart")!;
          const canvas = chart.querySelector("canvas")!;
          return Math.abs(
            canvas.getBoundingClientRect().width - chart.clientWidth,
          );
        }),
      )
      .toBeLessThan(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("releases observers, frames, tooltips, and timers when unmounted in StrictMode", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const w = window as any;
    // Dynamic imports use Vite's browser modules; this mounts a second isolated
    // application to exercise the real canvas lifecycle, including StrictMode.
    const React = (await import("/node_modules/.vite/deps/react.js" as string))
      .default;
    const { createRoot } = (
      await import("/node_modules/.vite/deps/react-dom_client.js" as string)
    ).default;
    const { App } = await import("/src/App.tsx" as string);
    const observers = new Set<ResizeObserver>();
    const NativeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeObserver {
      constructor(cb: ResizeObserverCallback) {
        super(cb);
        observers.add(this);
      }
      disconnect() {
        observers.delete(this);
        super.disconnect();
      }
    };
    const timers = new Set<number>();
    const frames = new Set<number>();
    const nativeFrame = window.requestAnimationFrame.bind(window);
    const nativeCancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => {
      const id = nativeFrame((stamp) => {
        frames.delete(id);
        callback(stamp);
      });
      frames.add(id);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      frames.delete(id);
      nativeCancel(id);
    };
    const nativeInterval = window.setInterval.bind(window);
    const nativeClear = window.clearInterval.bind(window);
    window.setInterval = ((...args: Parameters<typeof window.setInterval>) => {
      const id = nativeInterval(...args);
      timers.add(id);
      return id;
    }) as typeof window.setInterval;
    window.clearInterval = (id) => {
      timers.delete(id!);
      nativeClear(id);
    };
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    root.render(
      React.createElement(React.StrictMode, null, React.createElement(App)),
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    const mounted = {
      canvases: host.querySelectorAll("canvas").length,
      timers: timers.size,
      observers: observers.size,
    };
    root.unmount();
    host.remove();
    await new Promise((resolve) =>
      nativeFrame(() => nativeFrame(() => resolve(null))),
    );
    window.ResizeObserver = NativeObserver;
    window.setInterval = nativeInterval;
    window.clearInterval = nativeClear;
    window.requestAnimationFrame = nativeFrame;
    window.cancelAnimationFrame = nativeCancel;
    return {
      mounted,
      remaining: {
        timers: timers.size,
        observers: observers.size,
        frames: frames.size,
      },
      canvases: document.querySelectorAll(".cpu-chart canvas").length,
      tooltips: document.querySelectorAll(".yagr-tooltip").length,
    };
  });
  expect(result.mounted.canvases).toBe(1);
  expect(result.mounted.timers).toBe(1);
  expect(result.mounted.observers).toBeGreaterThan(0);
  expect(result.remaining).toEqual({ timers: 0, observers: 0, frames: 0 });
  expect(result.canvases).toBe(1);
  expect(result.tooltips).toBeLessThanOrEqual(1);
});

test("transitions from an empty API snapshot to populated data and back", async ({
  page,
}) => {
  const result = await page.evaluate(async () => {
    const React = (await import("/node_modules/.vite/deps/react.js" as string))
      .default;
    const { createRoot } = (
      await import("/node_modules/.vite/deps/react-dom_client.js" as string)
    ).default;
    // Use the exact loaded module URL: a second unversioned UIKit import would
    // create a separate theme context from the component's versioned import.
    const uiModule = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .find((name) => name.includes("/@gravity-ui_uikit.js?v="))!;
    const { ThemeProvider } = await import(uiModule);
    const { CpuChart } = await import("/src/CpuChart.tsx" as string);
    const { createDemoHistory } = await import("/src/cpu-data.ts" as string);
    const host = document.createElement("div");
    host.className = "app theme-light";
    document.body.append(host);
    const root = createRoot(host);
    const render = (history: any) =>
      root.render(
        React.createElement(
          ThemeProvider,
          { theme: "light" },
          React.createElement(CpuChart, {
            history,
            hours: 24,
            resetKey: 0,
            visible: true,
            onZoomChange: () => {},
          }),
        ),
      );
    const settle = () => new Promise((resolve) => setTimeout(resolve, 100));
    render({ timestamps: [], values: [] });
    await settle();
    const empty = host.textContent?.includes("Ожидаем данные");
    render(createDemoHistory());
    await settle();
    const loaded =
      !host.textContent?.includes("Ожидаем данные") &&
      host.querySelectorAll("canvas").length === 1;
    const loadedCount = (window as any).cpuInstance.series[0].length;
    render({ timestamps: [], values: [] });
    await settle();
    const cleared = host.textContent?.includes("Ожидаем данные");
    const clearedCount = (window as any).cpuInstance.series[0].length;
    const failed = host.textContent?.includes("Не удалось");
    root.unmount();
    host.remove();
    return { empty, loaded, loadedCount, cleared, clearedCount, failed };
  });
  expect(result).toEqual({
    empty: true,
    loaded: true,
    loadedCount: 43201,
    cleared: true,
    clearedCount: 0,
    failed: false,
  });
});
