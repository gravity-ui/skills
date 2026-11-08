// @vitest-environment jsdom
import * as React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import Yagr from '@gravity-ui/yagr';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {CpuLoadChart} from './CpuLoadChart';
import type {CpuLoadBatch, CpuLoadListener, CpuLoadSource} from './cpuLoadSource';

/* ------------------------------------------------------------------ */
/* Окружение: jsdom не умеет canvas, ResizeObserver, matchMedia и размеры */
/* ------------------------------------------------------------------ */

(globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT: boolean}).IS_REACT_ACT_ENVIRONMENT = true;

// uPlot обращается к matchMedia уже при импорте модуля, поэтому заглушка ставится до импортов.
vi.hoisted(() => {
    const mediaQueryList = {
        matches: false,
        media: '',
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
    };
    Object.defineProperty(globalThis, 'matchMedia', {configurable: true, writable: true, value: () => mediaQueryList});
});

const resizeObservers: Array<{observe: ReturnType<typeof vi.fn>; unobserve: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>}> = [];

class ResizeObserverStub {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_cb: ResizeObserverCallback) {
        resizeObservers.push(this);
    }
}

const rafQueue = new Map<number, FrameRequestCallback>();
let rafId = 0;
const flushFrames = () => {
    const callbacks = Array.from(rafQueue.values());
    rafQueue.clear();
    callbacks.forEach((cb) => cb(performance.now()));
};

function installBrowserStubs() {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        rafQueue.set(++rafId, cb);
        return rafId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
        rafQueue.delete(id);
    });
    vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({
            matches: false,
            media: '',
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    );

    const ctx = new Proxy({} as CanvasRenderingContext2D, {
        get: (_target, prop) => {
            if (prop === 'measureText') return () => ({width: 10});
            return () => undefined;
        },
        set: () => true,
    });
    HTMLCanvasElement.prototype.getContext = (() => ctx) as unknown as HTMLCanvasElement['getContext'];

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {configurable: true, get: () => 800});
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {configurable: true, get: () => 300});
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {configurable: true, get: () => 800});
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {configurable: true, get: () => 300});
}

/* ------------------------------------------------------------------ */
/* Управляемый источник                                                */
/* ------------------------------------------------------------------ */

function createManualSource(points: number) {
    const timeline = Array.from({length: points}, (_v, i) => 1_000_000 + i * 2000);
    const values = timeline.map((_t, i) => (i % 100) / 2);
    const listeners = new Set<CpuLoadListener>();

    const source: CpuLoadSource = {
        getSnapshot: () => ({timeline: timeline.slice(), values: values.slice()}),
        getStats: () => ({current: values[values.length - 1], average: 0, max: 0, points: values.length}),
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose: () => listeners.clear(),
    };

    return {
        source,
        listeners,
        emit(batch: CpuLoadBatch) {
            listeners.forEach((listener) => listener(batch));
        },
    };
}

/* ------------------------------------------------------------------ */

describe('CpuLoadChart', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        installBrowserStubs();
        resizeObservers.length = 0;
        rafQueue.clear();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        React.act(() => root.unmount());
        container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    const render = (ui: React.ReactElement) => React.act(() => root.render(ui));

    it('mounts once under StrictMode, applies live batches per frame and releases everything on unmount', () => {
        const setSeries = vi.spyOn(Yagr.prototype, 'setSeries');
        const dispose = vi.spyOn(Yagr.prototype, 'dispose');
        const manual = createManualSource(5000);

        render(
            <React.StrictMode>
                <ThemeProvider theme="light">
                    <CpuLoadChart source={manual.source} />
                </ThemeProvider>
            </React.StrictMode>,
        );

        // StrictMode: эффект смонтировался, размонтировался и смонтировался снова —
        // первый экземпляр уничтожен, живой ровно один.
        expect(dispose).toHaveBeenCalledTimes(1);
        expect(container.querySelectorAll('.yagr .uplot')).toHaveLength(1);
        expect(container.querySelector('.yagr')!.classList.contains('yagr_theme_light')).toBe(true);
        expect(manual.listeners.size).toBe(1);

        const chart = setSeries.mock.contexts[0] as Yagr | undefined; // ещё не вызывался
        expect(chart).toBeUndefined();

        // Живая точка при заполненном окне: добавилась одна, одна вытеснена → длина не меняется.
        const lastTs = 1_000_000 + 4999 * 2000;
        manual.emit({timeline: [lastTs + 2000], values: [77.7], dropped: 1});
        manual.emit({timeline: [lastTs + 4000], values: [55.5], dropped: 1});
        expect(setSeries).not.toHaveBeenCalled(); // до кадра ничего не рисуем
        flushFrames();

        expect(setSeries).toHaveBeenCalledTimes(1); // две порции схлопнулись в одно обновление
        const [timelineArg, seriesArg, optionsArg] = setSeries.mock.calls[0] as unknown as [number[], Array<{data: number[]}>, object];
        expect(timelineArg).toEqual([lastTs + 2000, lastTs + 4000]);
        expect(seriesArg[0].data).toEqual([77.7, 55.5]);
        expect(optionsArg).toEqual({incremental: true, splice: true});

        const live = setSeries.mock.contexts[0] as Yagr;
        expect(live.config.timeline).toHaveLength(5000);
        expect(live.config.timeline[0]).toBe(1_000_000 + 2 * 2000);
        expect(live.config.series[0].data.at(-1)).toBe(55.5);
        expect(live.uplot.data[0]).toHaveLength(5000);

        // Окно ещё не заполнено: просто дописываем.
        manual.emit({timeline: [lastTs + 6000], values: [10], dropped: 0});
        flushFrames();
        expect(setSeries.mock.calls[1][2]).toEqual({incremental: true});
        expect(live.config.timeline).toHaveLength(5001);

        // Отложенный кадр не должен пережить размонтирование.
        manual.emit({timeline: [lastTs + 8000], values: [10], dropped: 1});
        expect(rafQueue.size).toBe(1);

        React.act(() => root.unmount());

        expect(dispose).toHaveBeenCalledTimes(2);
        expect(rafQueue.size).toBe(0);
        expect(manual.listeners.size).toBe(0);
        expect(container.querySelector('.uplot')).toBeNull();
        expect(resizeObservers.every((ro) => ro.disconnect.mock.calls.length === 1)).toBe(true);
    });

    it('follows the ThemeProvider theme without recreating the chart', () => {
        const manual = createManualSource(100);
        const constructed = vi.spyOn(Yagr.prototype, 'setTheme');

        render(
            <ThemeProvider theme="light">
                <CpuLoadChart source={manual.source} />
            </ThemeProvider>,
        );
        const yagrRoot = container.querySelector('.yagr')!;
        const uplotRoot = container.querySelector('.uplot');
        expect(yagrRoot.classList.contains('yagr_theme_light')).toBe(true);

        const chart = constructed.mock.contexts[0] as Yagr;
        expect(chart.uplot.series[1].color).toBe('#2a78d6');

        render(
            <ThemeProvider theme="dark">
                <CpuLoadChart source={manual.source} />
            </ThemeProvider>,
        );

        expect(yagrRoot.classList.contains('yagr_theme_dark')).toBe(true);
        expect(yagrRoot.classList.contains('yagr_theme_light')).toBe(false);
        expect(chart.uplot.series[1].color).toBe('#3987e5');
        expect(container.querySelector('.uplot')).toBe(uplotRoot); // тот же экземпляр

        render(
            <ThemeProvider theme="dark-hc">
                <CpuLoadChart source={manual.source} />
            </ThemeProvider>,
        );
        expect(yagrRoot.classList.contains('yagr_theme_dark-hc')).toBe(true);
    });
});
