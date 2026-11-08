// @vitest-environment jsdom
import React, {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CpuChart} from './CpuChart';
import {DAY_MS, type CpuSample, type CpuSource} from './cpu-data';

const state = vi.hoisted(() => ({theme: 'light', charts: [] as any[], observers: [] as any[]}));
vi.mock('@gravity-ui/uikit', () => ({
  useThemeType: () => state.theme,
  Button: ({children, view: _view, size: _size, ...props}: any) => <button {...props}>{children}</button>,
}));
vi.mock('@gravity-ui/yagr', () => ({default: class {
  config: any;
  uplot = {scales: {x: {min: 10, max: 20}}, batch: (fn: () => void) => fn(),
    setScale: vi.fn((_key, range) => { this.uplot.scales.x = range; })};
  setSeries = vi.fn(); setTheme = vi.fn(); dispose = vi.fn(); reflow = vi.fn();
  constructor(_host: HTMLElement, config: any) { this.config = config; state.charts.push(this); }
}}));

let root: Root;
let host: HTMLDivElement;
let emit: (samples: readonly CpuSample[]) => void;
let source: CpuSource;
let unsubscribe: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  state.charts.length = 0; state.observers.length = 0; state.theme = 'light';
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(performance.now()), 16));
  vi.stubGlobal('cancelAnimationFrame', clearTimeout);
  vi.stubGlobal('ResizeObserver', class {
    disconnect = vi.fn(); observe = vi.fn();
    constructor(public callback: () => void) { state.observers.push(this); }
  });
  host = document.createElement('div'); document.body.append(host); root = createRoot(host);
  unsubscribe = vi.fn();
  source = {
    getHistory: () => [{timestamp: Date.now() - 1000, value: 20}],
    subscribe: listener => { emit = listener; return unsubscribe; },
  };
});
afterEach(() => {
  act(() => root.unmount()); host.remove(); vi.useRealTimers(); vi.unstubAllGlobals();
});
const mount = () => act(() => root.render(<CpuChart source={source} />));
const flush = () => act(() => vi.advanceTimersByTime(200));

describe('CPU chart lifecycle', () => {
  it('coalesces bursts and updates the same chart across data and theme changes', () => {
    mount(); const chart = state.charts[0];
    for (let i = 0; i < 50; i++) emit([{timestamp: Date.now(), value: i}]);
    flush();
    expect(chart.setSeries).toHaveBeenCalledTimes(1);
    expect(chart.setSeries.mock.calls[0][1].data.at(-1)).toBe(49);
    state.theme = 'dark'; mount();
    expect(chart.setTheme).toHaveBeenLastCalledWith('dark');
    expect(state.charts).toHaveLength(1);
  });
  it('keeps a selected range during updates and resets to the rolling day', () => {
    mount(); const chart = state.charts[0];
    act(() => chart.config.hooks.onSelect[0]());
    emit([{timestamp: Date.now(), value: 55}]); flush();
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', {min: 10, max: 20});
    act(() => host.querySelector('button')!.click()); flush();
    const range = chart.uplot.setScale.mock.lastCall[1];
    expect(range.max - range.min).toBe(DAY_MS);
    expect(range.max).toBeGreaterThan(Date.now() - 200);
  });
  it('accepts first live data after empty history without recreating the renderer', () => {
    source.getHistory = () => []; mount();
    expect(host.textContent).toContain('Ожидание данных');
    emit([{timestamp: Date.now(), value: 55}]); flush();
    expect(state.charts).toHaveLength(1);
    expect(state.charts[0].setSeries).toHaveBeenCalledWith('cpu', {data: [55]});
    expect(host.textContent).not.toContain('Ожидание данных');
  });
  it('disposes StrictMode instances, subscriptions, observers and pending work', () => {
    act(() => root.render(<React.StrictMode><CpuChart source={source} /></React.StrictMode>));
    expect(state.charts).toHaveLength(2);
    expect(state.charts[0].dispose).toHaveBeenCalledTimes(1);
    emit([{timestamp: Date.now(), value: 55}]);
    state.observers[1].callback();
    act(() => root.render(null));
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    expect(state.charts[1].dispose).toHaveBeenCalledTimes(1);
    expect(state.observers.every(observer => observer.disconnect.mock.calls.length === 1)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    emit([{timestamp: Date.now(), value: 90}]); flush();
    expect(state.charts[1].setSeries).not.toHaveBeenCalled();
  });
});
