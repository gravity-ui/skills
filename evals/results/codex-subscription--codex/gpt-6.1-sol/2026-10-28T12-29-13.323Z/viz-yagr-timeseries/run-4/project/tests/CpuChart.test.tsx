import { StrictMode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CpuSample, CpuSource } from "../src/cpuMetrics";
import { CpuChart } from "../src/CpuChart";

const mocks = vi.hoisted(() => ({
  instances: [] as any[],
  observers: [] as any[],
  theme: "light",
}));
vi.mock("@gravity-ui/uikit", () => ({ useThemeType: () => mocks.theme }));
vi.mock("@gravity-ui/yagr", () => ({
  default: class {
    config: any;
    series: any;
    setTheme = vi.fn();
    setSeries = vi.fn();
    dispose = vi.fn();
    reflow = vi.fn();
    plugins = { tooltip: { reset: vi.fn(), updateOptions: vi.fn() } };
    uplot = {
      redraw: vi.fn(),
      scales: { x: { min: 0, max: 1 } },
      batch: (callback: () => void) => callback(),
      setData: vi.fn(),
      setScale: vi.fn((key: string, range: any) => {
        this.uplot.scales.x = range;
      }),
    };
    constructor(_host: HTMLElement, config: any) {
      this.config = config;
      mocks.instances.push(this);
    }
  },
}));

function makeSource(
  history: readonly CpuSample[] = [{ timestamp: Date.now(), value: 40 }],
) {
  let listener: (samples: readonly CpuSample[]) => void = () => {};
  const unsubscribe = vi.fn();
  const source: CpuSource = {
    getHistory: () => history,
    subscribe: (callback) => {
      listener = callback;
      return unsubscribe;
    },
  };
  return {
    source,
    unsubscribe,
    emit: (samples: readonly CpuSample[]) => listener(samples),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  mocks.instances.length = 0;
  mocks.observers.length = 0;
  mocks.theme = "light";
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: () => void) {
        mocks.observers.push(this);
      }
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) =>
    window.setTimeout(callback, 16),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) =>
    window.clearTimeout(id),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("CPU chart lifecycle", () => {
  it("coalesces a burst without recreating the chart and preserves a selected scale", () => {
    const feed = makeSource();
    render(<CpuChart source={feed.source} />);
    const chart = mocks.instances[0];
    chart.setSeries.mockClear();
    act(() => {
      chart.config.hooks.onSelect[0]();
      chart.uplot.scales.x = { min: 100, max: 200 };
      for (let i = 1; i <= 100; i++)
        feed.emit([{ timestamp: Date.now() + i, value: i }]);
      vi.advanceTimersByTime(249);
    });
    expect(chart.setSeries).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(chart.setSeries).toHaveBeenCalledTimes(1);
    expect(chart.config.timeline.length).toBe(101);
    expect(chart.uplot.scales.x).toEqual({ min: 100, max: 200 });
    expect(mocks.instances).toHaveLength(1);
  });

  it("updates theme on the same chart instance", () => {
    const feed = makeSource();
    const view = render(<CpuChart source={feed.source} />);
    mocks.theme = "dark";
    view.rerender(<CpuChart source={feed.source} />);
    expect(mocks.instances).toHaveLength(1);
    expect(mocks.instances[0].setTheme).toHaveBeenLastCalledWith("dark");
  });

  it("keeps ingesting during pause and catches up on resume", () => {
    const feed = makeSource();
    render(<CpuChart source={feed.source} />);
    const chart = mocks.instances[0];
    fireEvent.click(screen.getByRole("button", { name: /Пауза/ }));
    chart.setSeries.mockClear();
    act(() => {
      feed.emit([{ timestamp: Date.now() + 1, value: 77 }]);
      vi.advanceTimersByTime(1000);
    });
    expect(chart.setSeries).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Продолжить/ }));
    expect(chart.setSeries).toHaveBeenLastCalledWith("cpu", { data: [40, 77] });
  });

  it("cleans up every StrictMode mount, pending resize, timers and the source", () => {
    const feed = makeSource();
    const view = render(
      <StrictMode>
        <CpuChart source={feed.source} />
      </StrictMode>,
    );
    expect(mocks.instances).toHaveLength(2);
    act(() => mocks.observers.at(-1).callback());
    view.unmount();
    expect(feed.unsubscribe).toHaveBeenCalledTimes(2);
    for (const chart of mocks.instances)
      expect(chart.dispose).toHaveBeenCalledTimes(1);
    for (const observer of mocks.observers)
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      feed.emit([{ timestamp: Date.now() + 1, value: 10 }]);
      vi.advanceTimersByTime(1000);
    });
    expect(mocks.instances.at(-1).reflow).not.toHaveBeenCalled();
  });

  it("clears all resources if subscribing fails", () => {
    const feed = makeSource();
    feed.source.subscribe = () => {
      throw new Error("Offline");
    };
    render(<CpuChart source={feed.source} />);
    expect(screen.getByRole("alert").textContent).toContain("Не удалось");
    expect(mocks.instances[0].dispose).toHaveBeenCalledTimes(1);
    expect(mocks.observers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
