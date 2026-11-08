import {beforeEach, describe, expect, it, vi} from 'vitest';

// Each engine module records when its code is evaluated. The laziness test checks
// that importing the registry evaluates neither engine.
const loaded = vi.hoisted(() => ({gravity: 0, yagr: 0}));
const settingsSet = vi.hoisted(() => vi.fn());

vi.mock('@gravity-ui/chartkit', () => ({settings: {set: settingsSet}}));
vi.mock('@gravity-ui/chartkit/gravity-charts', () => {
  loaded.gravity += 1;
  return {GravityChartsPlugin: {type: 'gravity-charts', renderer: () => null}};
});
vi.mock('@gravity-ui/chartkit/yagr', () => {
  loaded.yagr += 1;
  return {YagrPlugin: {type: 'yagr', renderer: () => null}};
});

import {ensureEngine} from '../engines';

describe('engine registry', () => {
  beforeEach(() => {
    settingsSet.mockClear();
  });

  it('does not evaluate any engine module just by importing the registry', () => {
    expect(loaded).toEqual({gravity: 0, yagr: 0});
  });

  it('loads only the requested engine and registers its plugin', async () => {
    await ensureEngine('sales');
    expect(loaded).toEqual({gravity: 1, yagr: 0});
    expect(settingsSet).toHaveBeenCalledWith({plugins: [expect.objectContaining({type: 'gravity-charts'})]});
  });

  it('loads each engine once and shares the in-flight promise', async () => {
    await Promise.all([ensureEngine('monitoring'), ensureEngine('monitoring')]);
    await ensureEngine('monitoring');
    expect(loaded.yagr).toBe(1);
    expect(settingsSet).toHaveBeenCalledTimes(1);
  });
});
