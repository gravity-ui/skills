// @vitest-environment jsdom
import {act, StrictMode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import type {CpuDataSource, CpuSample} from './cpu-data';
import {DAY_MS} from './cpu-data';
import {CpuChart} from './CpuChart';

const mocks = vi.hoisted(() => ({instances: [] as any[]}));
vi.mock('@gravity-ui/yagr', () => ({
  default: class {
    config: any;
    uplot = {scales: {x: {min: 1, max: 2}}, setScale: vi.fn((key: string, range: {min: number; max: number}) => {
      if (key === 'x') this.uplot.scales.x = range;
    })};
    resizeOb = {disconnect: vi.fn()};
    dispose = vi.fn();
    setSeries = vi.fn();
    setTheme = vi.fn();
    setScales = vi.fn();
    batch(fn: (update: {fns: (() => void)[]}) => void) {
      const update = {fns: [] as (() => void)[]};
      fn(update);
      update.fns.forEach((callback) => callback());
    }
    constructor(_root: HTMLElement, config: any) {
      this.config = config;
      mocks.instances.push(this);
    }
  },
}));

let container: HTMLDivElement;
let root: Root;
let emit: (samples: readonly CpuSample[]) => void;
let streamError: (error: Error) => void;
let source: CpuDataSource;
let unsubscribe: ReturnType<typeof vi.fn>;
let historySignal: AbortSignal;
const now = 1_800_000_000_000;
const samples = [{timestamp: now - 2000, value: 20}, {timestamp: now, value: 40}];

async function mount(theme: 'light' | 'dark' = 'light') {
  await act(async () => { root.render(<ThemeProvider theme={theme}><CpuChart source={source} /></ThemeProvider>); });
  await tick(30);
}

async function tick(ms: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT: true});
  mocks.instances.length = 0;
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  unsubscribe = vi.fn();
  source = {
    loadHistory: vi.fn(async (signal) => { historySignal = signal; return samples; }),
    subscribe: vi.fn((onSamples, onError) => { emit = onSamples; streamError = onError; return unsubscribe; }),
  };
});

afterEach(async () => {
  await act(async () => { root.unmount(); });
  container.remove();
  vi.useRealTimers();
});

describe('CpuChart lifecycle and streaming', () => {
  it('starts with a full day even when history has only a few points', async () => {
    await mount();
    const [key, range] = mocks.instances[0].uplot.setScale.mock.calls[0];
    expect(key).toBe('x');
    expect(range.max - range.min).toBe(DAY_MS);
    expect(range.max).toBeGreaterThanOrEqual(now);
    expect(range.max).toBeLessThanOrEqual(Date.now());
  });

  it('cleans up the temporary StrictMode subscription and retains one live chart', async () => {
    await act(async () => root.render(<StrictMode><ThemeProvider theme="light"><CpuChart source={source} /></ThemeProvider></StrictMode>));
    await tick(30);
    expect(source.subscribe).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(mocks.instances).toHaveLength(1);
    await act(async () => root.render(null));
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    expect(mocks.instances[0].dispose).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('batches a burst and updates one existing chart with the latest data', async () => {
    await mount();
    expect(mocks.instances).toHaveLength(1);
    const instance = mocks.instances[0];
    await act(async () => {
      for (let i = 1; i <= 1000; i++) emit([{timestamp: now + i, value: 50}]);
    });
    expect(instance.setSeries).not.toHaveBeenCalled();
    await tick(300);
    expect(instance.setSeries).toHaveBeenCalledTimes(1);
    expect(instance.setSeries.mock.calls[0][0]).toBe('cpu');
    expect(instance.setSeries.mock.calls[0][1].data).toHaveLength(1002);
    expect(instance.setScales).not.toHaveBeenCalled();
    expect(mocks.instances).toHaveLength(1);
  });

  it('updates theme without reopening the data source or recreating the chart', async () => {
    await mount();
    await mount('dark');
    expect(mocks.instances).toHaveLength(1);
    expect(mocks.instances[0].setTheme).toHaveBeenCalledWith('dark');
    expect(source.subscribe).toHaveBeenCalledTimes(1);
    expect(source.loadHistory).toHaveBeenCalledTimes(1);
  });

  it('retains zoom while data arrives and resets with the accessible control', async () => {
    await mount();
    const instance = mocks.instances[0];
    instance.uplot.scales.x = {min: now - 5000, max: now - 1000};
    await act(async () => {
      instance.config.hooks.onSelect[0]();
      emit([{timestamp: now + 2000, value: 60}]);
    });
    await tick(300);
    expect(instance.uplot.setScale).toHaveBeenLastCalledWith('x', {min: now - 5000, max: now - 1000});
    const reset = Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Сбросить масштаб')!;
    await act(async () => reset.click());
    await tick(300);
    expect(instance.uplot.setScale).toHaveBeenLastCalledWith('x', {min: now + 2000 - DAY_MS, max: now + 2000});
  });

  it('aborts history, unsubscribes, disconnects, disposes and cancels queued rendering', async () => {
    await mount();
    const instance = mocks.instances[0];
    await act(async () => emit([{timestamp: now + 2000, value: 60}]));
    await act(async () => root.render(null));
    expect(historySignal.aborted).toBe(true);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(instance.resizeOb.disconnect).toHaveBeenCalledTimes(1);
    expect(instance.dispose).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await tick(1000);
    expect(instance.setSeries).not.toHaveBeenCalled();
  });

  it('buffers live samples while history is loading', async () => {
    let resolve!: (value: CpuSample[]) => void;
    source.loadHistory = vi.fn(() => new Promise<CpuSample[]>((done) => { resolve = done; }));
    await mount();
    expect(container.textContent).toContain('Загружаем историю');
    await act(async () => {
      emit([{timestamp: now + 2000, value: 60}]);
      resolve(samples);
    });
    await tick(30);
    expect(mocks.instances[0].config.timeline).toEqual([now - 2000, now, now + 2000]);
  });

  it('renders an error and ignores a history response after unmount', async () => {
    let resolve!: (value: CpuSample[]) => void;
    source.loadHistory = vi.fn(() => new Promise<CpuSample[]>((done) => { resolve = done; }));
    await mount();
    await act(async () => streamError(new Error('offline')));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Не удалось получить данные');
    await act(async () => root.render(null));
    await act(async () => resolve(samples));
    await tick(1000);
    expect(mocks.instances).toHaveLength(0);
  });

  it('shows an empty state and creates the chart when the first live sample arrives', async () => {
    source.loadHistory = vi.fn(async () => []);
    await mount();
    expect(container.textContent).toContain('пока нет измерений');
    expect(mocks.instances).toHaveLength(0);
    await act(async () => emit([{timestamp: now + 2000, value: 30}]));
    await tick(300);
    expect(mocks.instances).toHaveLength(1);
    expect(container.textContent).not.toContain('пока нет измерений');
  });
});
