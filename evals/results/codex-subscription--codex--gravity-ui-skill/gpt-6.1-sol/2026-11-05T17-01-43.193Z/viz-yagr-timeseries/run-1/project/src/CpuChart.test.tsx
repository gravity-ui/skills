import React from 'react';
import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {YagrConfig} from '@gravity-ui/yagr';
import {CpuChart} from './CpuChart';
import {DAY_MS, type CpuSample} from './cpuData';
import type {CpuSource} from './cpuSource';

const mocks = vi.hoisted(() => ({theme: 'light', instances: [] as any[]}));
vi.mock('@gravity-ui/uikit', () => ({
  useThemeValue: () => mocks.theme,
  Text: ({children, as = 'span'}: any) => React.createElement(as, null, children),
  Button: ({children, onClick, disabled}: any) => React.createElement('button', {onClick, disabled}, children),
}));
vi.mock('@gravity-ui/yagr', () => ({default: vi.fn(function (_host, config) {
  const instance = {
    config, dispose: vi.fn(), reflow: vi.fn(), setTheme: vi.fn(), redraw: vi.fn(),
    setSeries: vi.fn(), getScales: () => ({x: {min: 10, max: 20}}),
    uplot: {batch: (fn: () => void) => fn(), setScale: vi.fn()},
  };
  mocks.instances.push(instance);
  return instance;
})}));

describe('CpuChart lifecycle and streaming', () => {
  let renderer: ReactTestRenderer | undefined;
  let emit: (samples: readonly CpuSample[]) => void;
  let reportError: (error: Error) => void;
  let signal: AbortSignal;
  let stop: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let source: CpuSource;
  let resize: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
    mocks.theme = 'light';
    mocks.instances.length = 0;
    stop = vi.fn();
    disconnect = vi.fn();
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) => setTimeout(() => fn(0), 0));
    vi.stubGlobal('cancelAnimationFrame', clearTimeout);
    vi.stubGlobal('ResizeObserver', class {
      constructor(fn: () => void) { resize = fn; }
      observe = vi.fn();
      disconnect = disconnect;
    });
    source = {
      loadHistory: vi.fn(async (options) => {
        signal = options.signal;
        return [{timestamp: Date.now() - 1000, value: 25}];
      }),
      subscribe: vi.fn((onSamples, onError) => {emit = onSamples; reportError = onError; return stop;}),
    };
  });

  afterEach(() => {
    if (renderer) act(() => renderer!.unmount());
    renderer = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function mount() {
    await act(async () => {
      renderer = create(<CpuChart source={source} />, {createNodeMock: () => ({replaceChildren: vi.fn()})});
    });
    act(() => {vi.advanceTimersByTime(1);});
  }

  it('coalesces bursts, keeps the chart alive, preserves zoom and changes theme in place', async () => {
    await mount();
    const instance = mocks.instances[0];
    expect(instance.uplot.setScale).toHaveBeenCalledWith('x', {min: Date.now() - 1 - DAY_MS, max: Date.now() - 1});
    // Native selection turns off following the live window.
    (instance.config as YagrConfig).hooks.onSelect![0]({chart: instance, from: 10, to: 20});
    for (let i = 0; i < 100; i++) emit([{timestamp: Date.now(), value: i}]);
    expect(instance.setSeries).not.toHaveBeenCalled();
    act(() => {vi.advanceTimersByTime(250);});
    expect(mocks.instances).toHaveLength(1);
    expect(instance.setSeries).toHaveBeenCalledTimes(1);
    expect(instance.setSeries).toHaveBeenCalledWith('cpu', {data: [25, 99]});
    expect(instance.uplot.setScale).toHaveBeenLastCalledWith('x', {min: 10, max: 20});
    mocks.theme = 'dark';
    act(() => renderer!.update(<CpuChart source={source} />));
    expect(instance.setTheme).toHaveBeenCalledWith('dark');
    expect(mocks.instances).toHaveLength(1);
    resize();
    expect(instance.reflow).toHaveBeenCalledOnce();
    act(() => renderer!.unmount());
    renderer = undefined;
    expect(signal.aborted).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(instance.dispose).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
    emit([{timestamp: Date.now(), value: 50}]);
    expect(instance.setSeries).toHaveBeenCalledTimes(2); // data + theme color
  });

  it('cancels pending history and animation work on unmount', async () => {
    let resolve!: (samples: readonly CpuSample[]) => void;
    source.loadHistory = (options) => {
      signal = options.signal;
      return new Promise((done) => {resolve = done;});
    };
    await mount();
    emit([{timestamp: Date.now(), value: 50}]);
    act(() => renderer!.unmount());
    renderer = undefined;
    await act(async () => resolve([{timestamp: Date.now(), value: 20}]));
    expect(signal.aborted).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
    expect(mocks.instances).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows an empty state, accepts the first live point, and reports transport errors', async () => {
    source.loadHistory = async () => [];
    await mount();
    expect(mocks.instances).toHaveLength(0);
    emit([{timestamp: Date.now(), value: 50}]);
    act(() => {vi.advanceTimersByTime(250);});
    expect(mocks.instances).toHaveLength(1);
    act(() => reportError(new Error('Соединение потеряно')));
    expect(JSON.stringify(renderer!.toJSON())).toContain('Соединение потеряно');
    expect(stop).toHaveBeenCalledOnce();
  });
});
