// @vitest-environment jsdom
import {StrictMode, act, type ReactNode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CpuChart} from './CpuChart';
import {DAY_MS, type CpuSample, type CpuSource} from './cpu-data';

const mocks = vi.hoisted(() => ({theme: 'light', instances: [] as any[], observers: [] as any[]}));
vi.mock('@gravity-ui/uikit', () => ({
  useThemeType: () => mocks.theme,
  Text: ({children}: {children: ReactNode}) => <span>{children}</span>,
  Button: ({children, onClick, disabled}: any) => <button onClick={onClick} disabled={disabled}>{children}</button>,
}));
vi.mock('@gravity-ui/yagr', () => ({
  default: class {
    config: any;
    uplot = {batch: (fn: () => void) => fn(), setScale: vi.fn()};
    setSeries = vi.fn();
    setTheme = vi.fn();
    reflow = vi.fn();
    dispose = vi.fn();
    batch = (fn: () => void) => fn();
    constructor(_host: HTMLElement, config: any) {
      this.config = config;
      mocks.instances.push(this);
    }
  },
}));

describe('CpuChart lifecycle', () => {
  let root: Root;
  let host: HTMLDivElement;
  let emit: (samples: readonly CpuSample[]) => void;
  let unsubscribe: ReturnType<typeof vi.fn>;
  let source: CpuSource;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    mocks.theme = 'light';
    mocks.instances.length = 0;
    mocks.observers.length = 0;
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(320);
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: () => void) {mocks.observers.push(this);}
    });
    unsubscribe = vi.fn();
    source = {subscribe(onSamples) {
      emit = onSamples;
      onSamples([{timestamp: Date.now(), value: 42}]);
      return unsubscribe;
    }};
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => root.unmount());
    host.remove();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const tick = (ms: number) => act(() => {vi.advanceTimersByTime(ms);});

  it('batches a burst, retains the instance and selected range, and applies theme changes', () => {
    act(() => root.render(<CpuChart source={source} />));
    tick(32);
    const instance = mocks.instances[0];
    expect(instance.config.chart.appearance.theme).toBe('light');
    const initialRange = instance.uplot.setScale.mock.lastCall[1];
    expect(initialRange.max - initialRange.min).toBe(DAY_MS);
    expect(Math.abs(initialRange.max - Date.now())).toBeLessThan(32);
    const from = Date.now() - 60_000;
    const to = Date.now();
    act(() => instance.config.hooks.onSelect[0]({from, to}));
    act(() => {
      for (let i = 0; i < 1000; i++) emit([{timestamp: Date.now(), value: i % 100}]);
    });
    expect(instance.setSeries).not.toHaveBeenCalled();
    tick(250);
    expect(instance.setSeries).toHaveBeenCalledTimes(1);
    expect(instance.uplot.setScale).toHaveBeenLastCalledWith('x', {min: from, max: to});
    expect(mocks.instances).toHaveLength(1);
    mocks.theme = 'dark';
    act(() => root.render(<CpuChart source={source} />));
    expect(instance.setTheme).toHaveBeenCalledWith('dark');
    expect(mocks.instances).toHaveLength(1);
    act(() => host.querySelector('button')!.click());
    tick(32);
    const latestRange = instance.uplot.setScale.mock.lastCall[1];
    expect(latestRange.max - latestRange.min).toBe(DAY_MS);
    expect(latestRange.max).toBeGreaterThan(to);
  });

  it('cleans up subscriptions, pending frames, observers and chart under StrictMode', () => {
    act(() => root.render(<StrictMode><CpuChart source={source} /></StrictMode>));
    tick(32);
    expect(mocks.instances).toHaveLength(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(mocks.observers[0].disconnect).toHaveBeenCalledOnce();
    const instance = mocks.instances[0];
    act(() => mocks.observers.at(-1).callback());
    act(() => root.unmount());
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    expect(mocks.observers.at(-1).disconnect).toHaveBeenCalledOnce();
    expect(instance.dispose).toHaveBeenCalledOnce();
    const resizeCalls = instance.reflow.mock.calls.length;
    act(() => emit([{timestamp: Date.now(), value: 90}]));
    tick(1000);
    expect(instance.reflow).toHaveBeenCalledTimes(resizeCalls);
    expect(instance.setSeries).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    // Create an empty root for the shared afterEach cleanup.
    root = createRoot(host);
  });
});
