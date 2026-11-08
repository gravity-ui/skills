import {describe, expect, it, vi} from 'vitest';
import type {EngineModule} from './engine';
import {createEngineLoader} from './loadEngine';

const fakeModule: EngineModule = {createEngine: () => ({update() {}, destroy() {}})};

describe('createEngineLoader', () => {
  it('импортирует каждый режим один раз и отдаёт тот же модуль', async () => {
    const sales = vi.fn(async () => fakeModule);
    const monitoring = vi.fn(async () => fakeModule);
    const load = createEngineLoader({sales, monitoring});

    const [a, b] = await Promise.all([load('sales'), load('sales')]);
    expect(a).toBe(b);
    expect(sales).toHaveBeenCalledTimes(1);
    expect(monitoring).not.toHaveBeenCalled();
  });

  it('не грузит движок, пока он не запрошен', () => {
    const monitoring = vi.fn(async () => fakeModule);
    createEngineLoader({sales: async () => fakeModule, monitoring});
    expect(monitoring).not.toHaveBeenCalled();
  });

  it('после ошибки сбрасывает кеш и повторяет импорт', async () => {
    const importer = vi
      .fn<() => Promise<EngineModule>>()
      .mockRejectedValueOnce(new Error('сеть недоступна'))
      .mockResolvedValueOnce(fakeModule);
    const load = createEngineLoader({sales: importer, monitoring: async () => fakeModule});

    await expect(load('sales')).rejects.toThrow('сеть недоступна');
    await expect(load('sales')).resolves.toBe(fakeModule);
    expect(importer).toHaveBeenCalledTimes(2);
  });
});
