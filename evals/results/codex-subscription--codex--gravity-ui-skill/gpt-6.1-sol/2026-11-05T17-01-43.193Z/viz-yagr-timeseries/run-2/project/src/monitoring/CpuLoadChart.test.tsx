// @vitest-environment jsdom
import {StrictMode, act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {YagrConfig} from '@gravity-ui/yagr';
import {CpuLoadChart} from './CpuLoadChart';
import {DAY_MS, type CpuSample, type CpuSource} from './cpuData';

const state = vi.hoisted(() => ({theme: 'light', charts: [] as any[], observers: [] as any[]}));

vi.mock('@gravity-ui/uikit', () => ({
  useThemeType: () => state.theme,
  Text: ({as: Tag = 'span', variant, color, children, ...props}: any) => <Tag {...props}>{children}</Tag>,
  Button: ({children, ...props}: any) => <button {...props}>{children}</button>,
}));

vi.mock('@gravity-ui/yagr', () => ({
  default: class {
    config: YagrConfig;
    uplot = {batch: (callback: () => void) => callback(), setScale: vi.fn()};
    batch = (callback: (batch: {fns: (() => void)[]}) => void) => {
      const batch = {fns: [] as (() => void)[]};
      callback(batch);
      batch.fns.forEach((fn) => fn());
    };
    setSeries = vi.fn();
    setTheme = vi.fn();
    redraw = vi.fn();
    reflow = vi.fn();
    dispose = vi.fn();
    constructor(_host: HTMLElement, config: YagrConfig) {
      this.config = config;
      state.charts.push(this);
    }
  },
}));

describe('CpuLoadChart lifecycle', () => {
  let root: Root;
  let container: HTMLDivElement;
  let onSamples: (samples: readonly CpuSample[]) => void;
  let onError: (error: Error) => void;
  let resolveHistory: (samples: readonly CpuSample[]) => void;
  let signal: AbortSignal;
  let source: CpuSource;
  let unsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true});
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    state.charts.length = 0;
    state.observers.length = 0;
    state.theme = 'light';
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: (entries: any[]) => void) { state.observers.push(this); }
    });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 16));
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    unsubscribe = vi.fn();
    source = {
      subscribe: vi.fn((samples, error) => {
        onSamples = samples;
        onError = error;
        return unsubscribe;
      }),
      loadHistory: vi.fn((_from, _to, abortSignal) => {
        signal = abortSignal;
        return new Promise<readonly CpuSample[]>((resolve) => { resolveHistory = resolve; });
      }),
    };
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function mount(history: readonly CpuSample[] = [{timestamp: Date.now() - 1000, value: 25}]) {
    await act(async () => root.render(<CpuLoadChart source={source} />));
    await act(async () => resolveHistory(history));
    await act(async () => { vi.advanceTimersByTime(120); });
    return state.charts[0];
  }

  it('merges live samples received during history loading, giving live corrections priority', async () => {
    await act(async () => root.render(<CpuLoadChart source={source} />));
    onSamples([{timestamp: Date.now(), value: 60}]);
    await act(async () => resolveHistory([
      {timestamp: Date.now() - 1000, value: 20}, {timestamp: Date.now(), value: 30},
    ]));
    await act(async () => { vi.advanceTimersByTime(120); });
    expect(state.charts[0].config.series[0].data).toEqual([20, 60]);
    expect(source.loadHistory).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), signal);
  });

  it('batches bursts, preserves zoom, and changes theme without creating another chart', async () => {
    const chart = await mount();
    const zoom = {min: Date.now() - 500, max: Date.now() - 100};
    chart.config.hooks.onSelect[0]({from: zoom.min, to: zoom.max});
    for (let i = 0; i < 100; i++) onSamples([{timestamp: Date.now(), value: i}]);
    await act(async () => { vi.advanceTimersByTime(120); });
    expect(chart.setSeries).toHaveBeenCalledTimes(1);
    expect(chart.setSeries).toHaveBeenLastCalledWith('cpu', {data: [25, 99]});
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', zoom);
    state.theme = 'dark';
    await act(async () => root.render(<CpuLoadChart source={source} />));
    expect(chart.setTheme).toHaveBeenCalledWith('dark');
    expect(state.charts).toHaveLength(1);
    await act(async () => (container.querySelector('button') as HTMLButtonElement).click());
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', {min: Date.now() - DAY_MS, max: Date.now()});
  });

  it('coalesces resizing and cancels all pending work on unmount', async () => {
    const chart = await mount();
    const observer = state.observers[0];
    observer.callback([{contentRect: {width: 375, height: 300}}]);
    observer.callback([{contentRect: {width: 1400, height: 400}}]);
    await act(async () => { vi.advanceTimersByTime(16); });
    expect(chart.reflow).toHaveBeenCalledTimes(1);
    observer.callback([{contentRect: {width: 400, height: 300}}]);
    onSamples([{timestamp: Date.now(), value: 50}]);
    await act(async () => root.unmount());
    expect(signal.aborted).toBe(true);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    expect(chart.dispose).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    onSamples([{timestamp: Date.now(), value: 99}]);
    vi.advanceTimersByTime(10_000);
    expect(chart.setSeries).not.toHaveBeenCalled();
    expect(chart.reflow).toHaveBeenCalledTimes(1);
  });

  it('ignores history resolved after unmount and cleans StrictMode subscriptions', async () => {
    await act(async () => root.render(<StrictMode><CpuLoadChart source={source} /></StrictMode>));
    expect(source.subscribe).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    await act(async () => root.unmount());
    await act(async () => resolveHistory([{timestamp: Date.now(), value: 50}]));
    vi.advanceTimersByTime(1000);
    expect(state.charts).toHaveLength(0);
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('recovers from an empty history when the first live sample arrives', async () => {
    await mount([]);
    expect(container.textContent).toContain('нет измерений');
    expect(state.charts).toHaveLength(0);
    onSamples([{timestamp: Date.now(), value: 0}]);
    await act(async () => { vi.advanceTimersByTime(120); });
    expect(state.charts).toHaveLength(1);
    expect(container.textContent).not.toContain('нет измерений');
  });

  it('expires the final measurement without sending empty arrays to the YAGR series setter', async () => {
    const chart = await mount([{timestamp: Date.now() - DAY_MS + 500, value: 50}]);
    await act(async () => { vi.advanceTimersByTime(1200); });
    expect(chart.dispose).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('нет измерений');
    expect(chart.setSeries).not.toHaveBeenCalled();
    onSamples([{timestamp: Date.now(), value: 10}]);
    await act(async () => { vi.advanceTimersByTime(120); });
    expect(state.charts).toHaveLength(2);
  });

  it('shows stream failures, stops work, and retries with a fresh subscription', async () => {
    await mount();
    await act(async () => onError(new Error('disconnected')));
    expect(container.textContent).toContain('Не удалось');
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    const retry = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Повторить')!;
    await act(async () => retry.click());
    expect(source.subscribe).toHaveBeenCalledTimes(2);
    expect(state.charts[0].dispose).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Загружаем');
  });
});
