// @vitest-environment jsdom
import * as React from 'react';
import {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import type Yagr from '@gravity-ui/yagr';
import type {AreaSeriesOptions} from '@gravity-ui/yagr';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';

import {CpuLoadChart} from './CpuLoadChart';
import type {CpuLoadSource, CpuSample} from './cpuLoadSource';

type Listener = (sample: CpuSample) => void;

/** Ручной источник: тест сам решает, когда и сколько точек отдать. */
function createManualSource(timeline: number[], values: number[]) {
    const listeners = new Set<Listener>();
    return {
        getSnapshot: () => ({timeline, values}),
        subscribe(listener: Listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        emit: (sample: CpuSample) => listeners.forEach((l) => l(sample)),
        listeners,
    } satisfies CpuLoadSource & Record<string, unknown>;
}

const observed = {count: 0};
class ResizeObserverStub {
    observe() {
        observed.count++;
    }
    unobserve() {
        observed.count--;
    }
    disconnect() {}
}

/** rAF под контролем теста: колбэк запускается только явным flush(). */
let pendingFrame: FrameRequestCallback | null = null;
function flushFrame() {
    const cb = pendingFrame;
    pendingFrame = null;
    if (cb) {
        act(() => cb(0));
    }
}

let container: HTMLDivElement;
let root: Root;

function mount(ui: React.ReactElement) {
    act(() => root.render(ui));
}

function renderChart(source: CpuLoadSource, theme: 'light' | 'dark', windowMs: number, strict = false) {
    let chart: Yagr | null = null;
    const ui = (
        <ThemeProvider theme={theme}>
            <CpuLoadChart source={source} windowMs={windowMs} onChartInit={(c) => (chart = c)} />
        </ThemeProvider>
    );
    mount(strict ? <React.StrictMode>{ui}</React.StrictMode> : ui);
    return () => chart!;
}

beforeAll(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        pendingFrame = cb;
        return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {
        pendingFrame = null;
    });
    (globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT = true;
});

beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperties(container, {clientWidth: {value: 800}, clientHeight: {value: 300}});
    document.body.appendChild(container);
    root = createRoot(container);
    pendingFrame = null;
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

const STEP = 1000;
const WINDOW = 10 * STEP;

function makeHistory(end: number, points: number, load = 50) {
    const timeline: number[] = [];
    const values: number[] = [];
    for (let i = points - 1; i >= 0; i--) {
        timeline.push(end - i * STEP);
        values.push(load);
    }
    return {timeline, values};
}

describe('CpuLoadChart', () => {
    it('renders the initial snapshot and subscribes to the source', () => {
        const {timeline, values} = makeHistory(100_000, 11);
        const source = createManualSource(timeline, values);
        const chart = renderChart(source, 'light', WINDOW);

        expect(container.querySelector('.cpu-load-chart canvas')).not.toBeNull();
        expect(container.querySelector('.yagr_theme_light')).not.toBeNull();
        expect(chart().uplot.data[0]).toHaveLength(11);
        expect(chart().uplot.data[1]).toEqual(values);
        expect(source.listeners.size).toBe(1);
        expect(observed.count).toBe(1);
    });

    it('batches samples per animation frame and keeps only the last window', () => {
        const {timeline, values} = makeHistory(100_000, 11);
        const source = createManualSource(timeline.slice(), values.slice());
        const chart = renderChart(source, 'light', WINDOW);

        source.emit({ts: 101_000, load: 70});
        source.emit({ts: 102_000, load: 80});
        // До кадра анимации график не трогаем.
        expect(chart().uplot.data[0]).toHaveLength(11);
        source.emit({ts: 103_000, load: 90});
        flushFrame();

        const [xs, ys] = chart().uplot.data;
        expect(xs).toHaveLength(11);
        expect(xs[0]).toBe(93_000);
        expect(xs[xs.length - 1]).toBe(103_000);
        expect(ys.slice(-3)).toEqual([70, 80, 90]);
        expect(chart().config.timeline).toHaveLength(11);
        expect(chart().config.series[0].data).toHaveLength(11);
    });

    it('falls back to a full reset for very large batches and keeps the window', () => {
        const {timeline, values} = makeHistory(100_000, 11);
        const source = createManualSource(timeline.slice(), values.slice());
        const chart = renderChart(source, 'light', WINDOW);

        for (let i = 1; i <= 6000; i++) {
            source.emit({ts: 100_000 + i * STEP, load: i % 100});
        }
        flushFrame();

        const [xs, ys] = chart().uplot.data;
        expect(xs).toHaveLength(11);
        expect(xs[xs.length - 1]).toBe(6_100_000);
        expect(xs[0]).toBe(6_090_000);
        expect(ys[ys.length - 1]).toBe(6000 % 100);
        // Полный путь должен сохранить настройки серии.
        expect(chart().config.series[0].id).toBe('cpu');
        expect(chart().config.series[0].type).toBe('area');
    });

    it('starts from an empty snapshot and picks up the first samples', () => {
        const source = createManualSource([], []);
        const chart = renderChart(source, 'light', WINDOW);
        expect(chart().isEmpty).toBe(true);

        source.emit({ts: 1_000, load: 12});
        source.emit({ts: 2_000, load: 13});
        flushFrame();

        expect(chart().uplot.data[0]).toEqual([1_000, 2_000]);
        expect(chart().uplot.data[1]).toEqual([12, 13]);
    });

    it('disposes the chart and unsubscribes on unmount, also with a pending frame', () => {
        const {timeline, values} = makeHistory(100_000, 11);
        const source = createManualSource(timeline, values);
        renderChart(source, 'light', WINDOW);
        source.emit({ts: 101_000, load: 70});
        expect(pendingFrame).not.toBeNull();

        act(() => root.unmount());
        root = createRoot(container);

        expect(source.listeners.size).toBe(0);
        expect(observed.count).toBe(0);
        expect(pendingFrame).toBeNull();
        expect(container.querySelector('canvas')).toBeNull();
    });

    it('survives StrictMode double mount with a single chart and subscription', () => {
        const {timeline, values} = makeHistory(100_000, 11);
        const source = createManualSource(timeline, values);
        renderChart(source, 'light', WINDOW, true);

        expect(container.querySelectorAll('canvas')).toHaveLength(1);
        expect(source.listeners.size).toBe(1);
        expect(observed.count).toBe(1);
    });

    it('switches yagr theme and series colors when the uikit theme changes', () => {
        const {timeline, values} = makeHistory(100_000, 11);
        const source = createManualSource(timeline, values);
        const chart = renderChart(source, 'light', WINDOW);
        const serie = () => chart().config.series[0] as AreaSeriesOptions;
        expect(serie().lineColor).toBe('#2a78d6');

        mount(
            <ThemeProvider theme="dark">
                <CpuLoadChart source={source} windowMs={WINDOW} />
            </ThemeProvider>,
        );

        expect(container.querySelector('.yagr_theme_dark')).not.toBeNull();
        expect(container.querySelector('.yagr_theme_light')).toBeNull();
        expect(chart().config.chart.appearance?.theme).toBe('dark');
        expect(serie().lineColor).toBe('#3987e5');
        const uSerie = chart().uplot.series[1];
        expect(uSerie.lineColor).toBe('#3987e5');
        const stroke = uSerie.stroke;
        expect(typeof stroke === 'function' ? stroke(chart().uplot, 1) : stroke).toBe('#3987e5');
    });
});
