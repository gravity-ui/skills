import { describe, expect, it } from 'vitest';
import { readLayouts } from './dashboard-utils';
import { dashboardStorageKey } from './dashboard-utils';
import { Widgets } from './widgets';

  const widgetIds = Object.keys(Widgets);
const validLayout = {
  lg: Object.keys(Widgets).map((id, index) => ({ i: id, x: 0, y: index * 8, w: 4, h: 8 })),
};

describe('readLayouts', () => {
  it('returns the default layout when storage is empty', () => {
    localStorage.removeItem(dashboardStorageKey);
    const layouts = readLayouts(widgetIds);
    expect(layouts.lg).toHaveLength(6);
    expect(layouts.md.every((item) => item.w <= 8)).toBe(true);
    expect(layouts.sm.every((item) => item.w <= 4)).toBe(true);
  });

  it('rejects unknown widget identifiers', () => {
    localStorage.setItem(dashboardStorageKey, JSON.stringify({
      lg: [{ ...validLayout.lg[0], i: 'unknown' }],
    }));
    expect(readLayouts(widgetIds).lg).toHaveLength(6);
  });

  it('accepts persisted layouts with known widget identifiers', () => {
    localStorage.setItem(dashboardStorageKey, JSON.stringify(validLayout));
    expect(readLayouts(widgetIds).lg).toEqual(validLayout.lg);
  });
});
