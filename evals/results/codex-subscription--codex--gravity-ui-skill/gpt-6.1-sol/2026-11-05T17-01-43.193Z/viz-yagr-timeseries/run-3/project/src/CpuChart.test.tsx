import {act, create, type ReactTestRenderer} from 'react-test-renderer';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import {CpuChart} from './CpuChart';
import {CpuBuffer} from './cpu-data';

const mock = vi.hoisted(() => ({
  theme: 'light',
  construct: vi.fn(), dispose: vi.fn(), reflow: vi.fn(), redraw: vi.fn(),
  setSeries: vi.fn(), setTheme: vi.fn(), setScale: vi.fn(),
  disconnect: vi.fn(), cancelFrame: vi.fn(),
}));

vi.mock('@gravity-ui/uikit', () => ({useThemeType: () => mock.theme, Button: () => null, Text: () => null}));
vi.mock('@gravity-ui/yagr', () => ({default: class {
  config = {timeline: [] as number[]};
  uplot = {batch: (fn: () => void) => fn(), setScale: mock.setScale};
  setTheme = mock.setTheme;
  setSeries = mock.setSeries;
  redraw = mock.redraw;
  reflow = mock.reflow;
  dispose = mock.dispose;
  getScales = () => ({x: {min: 100, max: 200}});
  constructor(root: unknown, config: unknown) {mock.construct(root, config);}
}}));

describe('CPU Canvas lifecycle', () => {
  let view: ReactTestRenderer | undefined;
  let resize: () => void;
  let frame: FrameRequestCallback;
  const buffer = new CpuBuffer();
  buffer.append([{timestamp: 100_000_000, value: 25}, {timestamp: 100_002_000, value: 30}]);
  const snapshot = buffer.snapshot();
  const onZoom = vi.fn();
  const root = {clientWidth: 800, clientHeight: 350, replaceChildren: vi.fn()};

  beforeEach(() => {
    vi.clearAllMocks();
    mock.theme = 'light';
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) {resize = callback;}
      observe() {}
      disconnect = mock.disconnect;
    });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {frame = callback; return 17;});
    vi.stubGlobal('cancelAnimationFrame', mock.cancelFrame);
  });

  afterEach(() => {
    act(() => view?.unmount());
    view = undefined;
    vi.unstubAllGlobals();
  });

  function mount() {
    act(() => {view = create(<CpuChart snapshot={snapshot} hours={24} resetKey={0} onZoom={onZoom} />, {createNodeMock: () => root});});
  }

  it('reuses the renderer during stream, range, and theme changes', () => {
    mount();
    buffer.append([{timestamp: 100_004_000, value: 35}]);
    act(() => view!.update(<CpuChart snapshot={buffer.snapshot()} hours={6} resetKey={0} onZoom={onZoom} />));
    mock.theme = 'dark';
    act(() => view!.update(<CpuChart snapshot={buffer.snapshot()} hours={6} resetKey={0} onZoom={onZoom} />));
    expect(mock.construct).toHaveBeenCalledTimes(1);
    expect(mock.setTheme).toHaveBeenLastCalledWith('dark');
    expect(mock.setScale).toHaveBeenLastCalledWith('x', {min: 100_004_000 - 6 * 3_600_000, max: 100_004_000});
    expect(mock.dispose).not.toHaveBeenCalled();
  });

  it('keeps a user-selected range on incoming data', () => {
    mount();
    const config = mock.construct.mock.calls[0][1] as MinimalValidConfig;
    act(() => {config.hooks?.onSelect?.forEach((callback) => callback({} as never));});
    expect(onZoom).toHaveBeenLastCalledWith(true);
    act(() => view!.update(<CpuChart snapshot={buffer.snapshot()} hours={24} resetKey={0} onZoom={onZoom} />));
    expect(mock.setScale).toHaveBeenLastCalledWith('x', {min: 100, max: 200});
  });

  it('disconnects observation, cancels queued resize and disposes the chart on unmount', () => {
    mount();
    act(() => {resize(); resize();});
    act(() => view!.unmount());
    view = undefined;
    expect(mock.disconnect).toHaveBeenCalledTimes(1);
    expect(mock.cancelFrame).toHaveBeenCalledWith(17);
    expect(mock.dispose).toHaveBeenCalledTimes(1);
    frame(0);
    expect(mock.reflow).not.toHaveBeenCalled();
  });
});
