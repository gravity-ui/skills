import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {CpuSample, CpuDataSource} from './cpu-data';
import {mountCpuChart} from './cpu-chart';

const mocks = vi.hoisted(() => ({instances: [] as any[], observers: [] as any[]}));
vi.mock('@gravity-ui/yagr', () => ({
  default: class {
    config: any;
    uplot = {batch: (fn: () => void) => fn(), setScale: vi.fn()};
    setSeries = vi.fn();
    setTheme = vi.fn();
    reflow = vi.fn();
    dispose = vi.fn();
    batch = (fn: () => void) => fn();
    constructor(_host: unknown, config: any) {
      this.config = config;
      mocks.instances.push(this);
    }
  },
}));

describe('CPU chart lifecycle and streaming', () => {
  let emit: (samples: readonly CpuSample[]) => void;
  let fail: (error: Error) => void;
  let source: CpuDataSource;
  let stop: ReturnType<typeof vi.fn>;
  let host: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.instances.length = 0;
    mocks.observers.length = 0;
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('requestAnimationFrame', (fn: () => void) => setTimeout(fn, 16));
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: () => void) { mocks.observers.push(this); }
    });
    stop = vi.fn();
    source = {subscribe(onData, onError) { emit = onData; fail = onError; return stop; }};
    host = {clientWidth: 800, clientHeight: 320, style: {}, replaceChildren: vi.fn()} as unknown as HTMLElement;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('coalesces bursts, preserves selection and updates theme without reconstructing the chart', () => {
    const controller = mountCpuChart(host, source, 'light', vi.fn());
    emit([{timestamp: Date.now(), value: 10}]);
    vi.advanceTimersByTime(20);
    const chart = mocks.instances[0];
    const from = Date.now() - 10_000;
    const to = Date.now();
    chart.config.hooks.onSelect[0]({from, to});
    for (let i = 0; i < 100; i++) emit([{timestamp: Date.now(), value: i}]);
    vi.advanceTimersByTime(300);
    expect(mocks.instances).toHaveLength(1);
    expect(chart.setSeries).toHaveBeenCalledTimes(1);
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', {min: from, max: to});
    controller.setTheme('dark');
    expect(chart.setTheme).toHaveBeenCalledWith('dark');
    expect(mocks.instances).toHaveLength(1);
    controller.resetZoom();
    vi.advanceTimersByTime(300);
    expect(chart.uplot.setScale.mock.lastCall[1].max).toBeGreaterThan(to);
    controller.dispose();
  });

  it('cancels delayed draws, disconnects observers and ignores callbacks after unmount', () => {
    const status = vi.fn();
    const controller = mountCpuChart(host, source, 'light', status);
    emit([{timestamp: Date.now(), value: 10}]);
    vi.advanceTimersByTime(20);
    const chart = mocks.instances[0];
    emit([{timestamp: Date.now(), value: 20}]);
    mocks.observers[0].callback();
    controller.dispose();
    controller.dispose();
    const calls = status.mock.calls.length;
    emit([{timestamp: Date.now(), value: 30}]);
    fail(new Error('late error'));
    vi.advanceTimersByTime(2_000);
    expect(stop).toHaveBeenCalledTimes(1);
    expect(chart.dispose).toHaveBeenCalledTimes(1);
    expect(mocks.observers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledTimes(calls);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('can mount again after StrictMode-style cleanup and exposes empty/error/recovery states', () => {
    const first = mountCpuChart(host, source, 'light', vi.fn());
    first.dispose();
    const status = vi.fn();
    const second = mountCpuChart(host, source, 'dark', status);
    emit([]);
    vi.advanceTimersByTime(20);
    expect(status.mock.lastCall?.[0].phase).toBe('empty');
    fail(new Error('offline'));
    expect(status.mock.lastCall?.[0].phase).toBe('error');
    emit([{timestamp: Date.now(), value: 0}]);
    vi.advanceTimersByTime(300);
    expect(status.mock.lastCall?.[0]).toMatchObject({phase: 'ready', latest: 0});
    second.dispose();
    expect(stop).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
