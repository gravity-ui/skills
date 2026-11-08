import {beforeEach, describe, expect, it, vi} from 'vitest';

const salesLoads = vi.fn();
const monitoringLoads = vi.fn();
let failSales = false;

// Модули движков подменяем целиком: реальные тянут плагины ChartKit и CSS,
// а здесь проверяется только контракт ленивой загрузки.
vi.mock('../engines/salesEngine', () => {
    salesLoads();
    return {
        get salesEngine() {
            if (failSales) {
                throw new Error('network down');
            }
            return {
                mode: 'sales',
                chartKitType: 'gravity-charts',
                library: 'mock-charts',
                buildProps: () => ({type: 'gravity-charts', data: {series: {data: []}}}),
            };
        },
    };
});

vi.mock('../engines/monitoringEngine', () => {
    monitoringLoads();
    return {
        monitoringEngine: {
            mode: 'monitoring',
            chartKitType: 'yagr',
            library: 'mock-yagr',
            buildProps: () => ({type: 'yagr', data: {data: {timeline: [], graphs: []}, libraryConfig: {}}}),
        },
    };
});

async function freshRegistry() {
    vi.resetModules();
    return import('../engines/registry');
}

describe('engine registry', () => {
    beforeEach(() => {
        salesLoads.mockClear();
        monitoringLoads.mockClear();
        failSales = false;
    });

    it('does not load any engine until one is requested', async () => {
        const registry = await freshRegistry();
        expect(registry.getLoadedEngine('sales')).toBeUndefined();
        expect(registry.getLoadedEngine('monitoring')).toBeUndefined();
        expect(salesLoads).not.toHaveBeenCalled();
        expect(monitoringLoads).not.toHaveBeenCalled();
    });

    it('loads only the requested engine and caches it', async () => {
        const registry = await freshRegistry();
        const a = await registry.loadEngine('sales');
        const b = await registry.loadEngine('sales');
        expect(a).toBe(b);
        expect(a.mode).toBe('sales');
        expect(a.chartKitType).toBe('gravity-charts');
        expect(registry.getLoadedEngine('sales')).toBe(a);
        expect(salesLoads).toHaveBeenCalledTimes(1);
        expect(monitoringLoads).not.toHaveBeenCalled();
        expect(registry.getLoadedEngine('monitoring')).toBeUndefined();
    });

    it('loads the monitoring engine independently of the sales one', async () => {
        const registry = await freshRegistry();
        const engine = await registry.loadEngine('monitoring');
        expect(engine.chartKitType).toBe('yagr');
        expect(registry.getLoadedEngine('monitoring')).toBe(engine);
        expect(salesLoads).not.toHaveBeenCalled();
    });

    it('retries after a failed load instead of caching the rejection', async () => {
        failSales = true;
        const registry = await freshRegistry();
        await expect(registry.loadEngine('sales')).rejects.toThrow('network down');
        expect(registry.getLoadedEngine('sales')).toBeUndefined();

        failSales = false;
        const engine = await registry.loadEngine('sales');
        expect(engine.mode).toBe('sales');
        expect(registry.getLoadedEngine('sales')).toBe(engine);
    });

    it('preloadEngine never rejects', async () => {
        failSales = true;
        const registry = await freshRegistry();
        expect(() => registry.preloadEngine('sales')).not.toThrow();
        await new Promise((r) => setTimeout(r, 0));
        expect(registry.getLoadedEngine('sales')).toBeUndefined();
    });
});
