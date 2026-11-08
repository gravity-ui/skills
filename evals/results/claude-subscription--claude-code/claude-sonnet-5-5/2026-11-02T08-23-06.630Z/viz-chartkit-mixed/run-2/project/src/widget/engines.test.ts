import {beforeEach, describe, expect, it, vi} from 'vitest';

// settings в ChartKit — синглтон, а список плагинов только пополняется,
// поэтому для изоляции каждый тест берёт свежие экземпляры модулей.
async function fresh() {
    vi.resetModules();
    const {settings} = await import('@gravity-ui/chartkit');
    const {loadEngine} = await import('./engines');
    const types = () => settings.get('plugins').map((p) => p.type);
    return {loadEngine, types};
}

describe('loadEngine', () => {
    beforeEach(() => vi.resetModules());

    it('registers only the engine of the requested mode', async () => {
        const {loadEngine, types} = await fresh();
        expect(types()).toEqual([]);
        await loadEngine('sales');
        expect(types()).toEqual(['gravity-charts']);
    });

    it('registers the second engine without dropping the first', async () => {
        const {loadEngine, types} = await fresh();
        await loadEngine('sales');
        await loadEngine('monitoring');
        expect(types().sort()).toEqual(['gravity-charts', 'yagr']);
    });

    it('is idempotent and shares one promise per mode', async () => {
        const {loadEngine, types} = await fresh();
        const a = loadEngine('monitoring');
        expect(loadEngine('monitoring')).toBe(a);
        await a;
        await loadEngine('monitoring');
        expect(types()).toEqual(['yagr']);
    });
});
