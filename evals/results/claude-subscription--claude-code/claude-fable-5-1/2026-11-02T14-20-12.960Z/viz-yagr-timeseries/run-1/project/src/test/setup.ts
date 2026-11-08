/**
 * Заглушки браузерных API, которых нет в jsdom, но которые нужны uPlot/yagr
 * уже на этапе импорта модуля (matchMedia) и при создании графика (canvas, ResizeObserver).
 */
import {vi} from 'vitest';

if (typeof window !== 'undefined') {
    if (typeof window.matchMedia !== 'function') {
        window.matchMedia = (query: string) =>
            ({
                matches: false,
                media: query,
                onchange: null,
                addListener: () => undefined,
                removeListener: () => undefined,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
                dispatchEvent: () => false,
            }) as MediaQueryList;
    }

    const noop = () => undefined;
    const ctx = new Proxy(
        {measureText: () => ({width: 20, fontBoundingBoxAscent: 10}), canvas: {}},
        {get: (target, key) => (key in target ? target[key as keyof typeof target] : noop)},
    );
    HTMLCanvasElement.prototype.getContext = (() => ctx) as unknown as HTMLCanvasElement['getContext'];
    HTMLCanvasElement.prototype.toDataURL = () => 'data:,';

    if (typeof globalThis.ResizeObserver === 'undefined') {
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            },
        );
    }
}
