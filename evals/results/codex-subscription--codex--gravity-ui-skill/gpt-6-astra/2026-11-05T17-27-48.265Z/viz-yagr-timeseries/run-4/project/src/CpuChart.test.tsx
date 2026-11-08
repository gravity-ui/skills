// @vitest-environment jsdom
import {act, StrictMode} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CpuChart} from './CpuChart';
import type {CpuSample, CpuSource} from './cpu-data';

const mocks = vi.hoisted(() => ({charts: [] as any[], observers: [] as any[], theme: 'light'}));
vi.mock('@gravity-ui/uikit', async () => {
  const {createElement} = await import('react');
  return {
    useThemeType: () => mocks.theme,
    Text: ({as = 'span', children, id}: any) => createElement(as, {id}, children),
    Button: ({children, onClick, disabled}: any) => createElement('button', {onClick, disabled}, children),
  };
});
vi.mock('@gravity-ui/yagr', () => ({default: class {
  config: any;
  series: any;
  uplot = {setData: vi.fn(), setScale: vi.fn(), redraw: vi.fn()};
  setTheme = vi.fn();
  setSeries = vi.fn();
  redraw = vi.fn();
  reflow = vi.fn();
  dispose = vi.fn();
  constructor(_host: HTMLElement, config: any) { this.config = config; mocks.charts.push(this); }
}}));

let root: Root;
let container: HTMLDivElement;
let onSamples: (points: readonly CpuSample[]) => void;
let onError: (error: Error) => void;
let unsubscribe: ReturnType<typeof vi.fn>;
let source: CpuSource;
let signal: AbortSignal;

async function advance(ms = 300) { await act(async () => { vi.advanceTimersByTime(ms); }); }
async function mount(strict = false) {
  await act(async () => { root.render(strict ? <StrictMode><CpuChart source={source} /></StrictMode> : <CpuChart source={source} />); });
  await advance();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  mocks.charts.length = 0;
  mocks.observers.length = 0;
  mocks.theme = 'light';
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class {
    callback: () => void;
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(callback: () => void) { this.callback = callback; mocks.observers.push(this); }
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  unsubscribe = vi.fn();
  source = {
    loadHistory: vi.fn(async abortSignal => {
      signal = abortSignal;
      return [{timestamp: Date.now() - 2000, value: 10}, {timestamp: Date.now(), value: 20}];
    }),
    subscribe: vi.fn((samples, error) => { onSamples = samples; onError = error; return unsubscribe; }),
  };
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('CPU chart lifecycle', () => {
  it('batches burst updates, retains zoom and changes theme without recreating Yagr', async () => {
    await mount();
    const chart = mocks.charts[0];
    const zoom = {min: Date.now() - 1000, max: Date.now()};
    await act(async () => chart.config.hooks.onSelect[0]({from: zoom.min, to: zoom.max}));
    vi.advanceTimersByTime(100);
    const before = chart.uplot.setData.mock.calls.length;
    for (let i = 0; i < 100; i++) onSamples([{timestamp: Date.now() - 99 + i, value: i}]);
    expect(chart.uplot.setData).toHaveBeenCalledTimes(before);
    await advance();
    expect(chart.uplot.setData).toHaveBeenCalledTimes(before + 1);
    expect(chart.uplot.setScale).toHaveBeenLastCalledWith('x', zoom);
    expect(chart.config.timeline.length).toBe(102);
    mocks.theme = 'dark';
    await act(async () => root.render(<CpuChart source={source} />));
    expect(chart.setTheme).toHaveBeenCalledWith('dark');
    expect(mocks.charts).toHaveLength(1);
  });

  it('aborts history, unsubscribes, disconnects observers and disposes on Strict Mode cleanup', async () => {
    await mount(true);
    expect(source.subscribe).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(mocks.observers[0].disconnect).toHaveBeenCalledOnce();
    const chart = mocks.charts[0];
    mocks.observers[1].callback(); // Queue a resize just before unmount.
    await act(async () => root.unmount());
    expect(signal.aborted).toBe(true);
    expect(unsubscribe).toHaveBeenCalledTimes(2);
    expect(mocks.observers[1].disconnect).toHaveBeenCalledOnce();
    expect(chart.dispose).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    onSamples([{timestamp: Date.now(), value: 99}]);
    await advance();
    expect(chart.reflow).not.toHaveBeenCalled();
  });

  it('ignores history resolved after unmount', async () => {
    let resolve!: (samples: CpuSample[]) => void;
    source.loadHistory = () => new Promise(done => { resolve = done; });
    await mount();
    expect(container.textContent).toContain('Загрузка метрик');
    await act(async () => root.unmount());
    await act(async () => resolve([{timestamp: Date.now(), value: 90}]));
    await advance();
    expect(mocks.charts).toHaveLength(0);
  });

  it('shows empty and error states and retries the source', async () => {
    source.loadHistory = async () => [];
    await mount();
    expect(container.textContent).toContain('Нет данных за последние сутки');
    await act(async () => onError(new Error('Соединение потеряно')));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Соединение потеряно');
    const retry = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Повторить')!;
    await act(async () => retry.click());
    await advance();
    expect(source.subscribe).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('continues collecting while paused and displays accumulated samples on resume', async () => {
    await mount();
    const chart = mocks.charts[0];
    const pause = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Приостановить')!;
    await act(async () => pause.click());
    const before = chart.uplot.setData.mock.calls.length;
    onSamples([{timestamp: Date.now(), value: 80}]);
    await advance(1000);
    expect(chart.uplot.setData).toHaveBeenCalledTimes(before);
    await act(async () => pause.click());
    await advance();
    expect(chart.config.series[0].data.at(-1)).toBe(80);
  });
});
