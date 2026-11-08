// @vitest-environment jsdom
import {act, StrictMode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CpuChart} from './CpuChart';
import {App} from './App';
import {DAY_MS, type CpuData} from './cpuData';

const mocks = vi.hoisted(() => ({theme: 'light', charts: [] as any[]}));
vi.mock('@gravity-ui/uikit', () => ({
  useThemeType: () => mocks.theme,
  Button: ({children, onClick}: any) => <button onClick={onClick}>{children}</button>,
}));
vi.mock('@gravity-ui/yagr', () => ({
  default: class {
    config: any;
    plugins = {tooltip: {reset: vi.fn()}};
    uplot = {
      scales: {x: {min: 0, max: DAY_MS}},
      batch: (callback: () => void) => callback(),
      setScale: vi.fn((_name, range) => { this.uplot.scales.x = range; }),
    };
    setSeries = vi.fn();
    setTheme = vi.fn();
    reflow = vi.fn();
    dispose = vi.fn();
    constructor(_host: HTMLElement, config: any) {
      this.config = config;
      mocks.charts.push(this);
    }
  },
}));

let root: Root;
let container: HTMLDivElement;
let frames: Map<number, FrameRequestCallback>;
let observers: {callback: () => void; disconnect: ReturnType<typeof vi.fn>}[];
const now = DAY_MS * 2;
const sample = (value: number): CpuData => ({timeline: [now - 1_000, now], values: [20, value]});
const render = (data = sample(40)) => act(() => root.render(<StrictMode><CpuChart data={data} /></StrictMode>));
const flush = () => act(() => {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((callback) => callback(0));
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(Date, 'now').mockReturnValue(now);
  mocks.charts.length = 0;
  mocks.theme = 'light';
  frames = new Map();
  observers = [];
  let id = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (frame: number) => frames.delete(frame));
  vi.stubGlobal('ResizeObserver', class {
    disconnect = vi.fn();
    observe = vi.fn();
    constructor(public callback: () => void) { observers.push(this); }
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('CPU chart lifecycle', () => {
  it('stops the demo stream timer when the monitoring page unmounts', () => {
    vi.useFakeTimers({toFake: ['setInterval', 'clearInterval']});
    act(() => root.render(<StrictMode><App /></StrictMode>));
    expect(vi.getTimerCount()).toBe(1);
    act(() => root.unmount());
    expect(vi.getTimerCount()).toBe(0);
    root = createRoot(container);
  });

  it('coalesces snapshots and preserves the instance across updates and theme changes', () => {
    render();
    render(sample(50));
    render(sample(60));
    expect(frames.size).toBe(1);
    flush();
    // StrictMode deliberately mounts, cleans up, then mounts again.
    expect(mocks.charts).toHaveLength(2);
    const [old, chart] = mocks.charts;
    expect(old.dispose).toHaveBeenCalledOnce();
    expect(chart.setSeries).toHaveBeenCalledExactlyOnceWith('cpu', {data: [20, 60]});
    mocks.theme = 'dark';
    render(sample(70));
    flush();
    expect(mocks.charts).toHaveLength(2);
    expect(chart.setTheme).toHaveBeenLastCalledWith('dark');
    expect(chart.setSeries).toHaveBeenLastCalledWith('cpu', {data: [20, 70]});
  });

  it('retains a user zoom during streaming and restores live mode from the button', () => {
    render();
    flush();
    const chart = mocks.charts.at(-1);
    const zoom = {min: now - 5_000, max: now - 1_000};
    chart.uplot.scales.x = zoom;
    act(() => chart.config.hooks.onSelect[0]({from: zoom.min, to: zoom.max}));
    render(sample(80));
    flush();
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', zoom);
    act(() => [...container.querySelectorAll('button')].at(-1)!.click());
    flush();
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', {min: now - DAY_MS, max: now});
  });

  it('clears stale measurements for empty input and recovers on the next snapshot', () => {
    render();
    flush();
    render({timeline: [], values: []});
    flush();
    expect(container.textContent).toContain('Нет данных за последние сутки');
    expect(mocks.charts.at(-1).setSeries).toHaveBeenLastCalledWith('cpu', {data: [null, null]});
    render(sample(50));
    flush();
    expect(container.textContent).not.toContain('Нет данных за последние сутки');
    expect(mocks.charts).toHaveLength(2);
  });

  it('disconnects observers, cancels frames and disposes every StrictMode instance', () => {
    render();
    const host = container.querySelector('.chart-host')!;
    Object.defineProperties(host, {clientWidth: {value: 900}, clientHeight: {value: 400}});
    observers.at(-1)!.callback();
    flush();
    expect(mocks.charts.at(-1).reflow).toHaveBeenCalledOnce();
    render(sample(90));
    act(() => root.unmount());
    expect(frames.size).toBe(0);
    for (const chart of mocks.charts) expect(chart.dispose).toHaveBeenCalledOnce();
    for (const observer of observers) expect(observer.disconnect).toHaveBeenCalledOnce();
    observers.at(-1)!.callback();
    expect(frames.size).toBe(0);
    // Provide an empty root for the common cleanup.
    root = createRoot(container);
  });
});
