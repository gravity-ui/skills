import {describe, expect, it} from 'vitest';

import {nearestIndex, niceTicks} from './format';
import {makeMonitoringData, makeSalesData, monthTick, rubAxis} from '../data/demoData';
import {MAX_SERIES, PALETTES} from './colors';

describe('niceTicks', () => {
  it('покрывает максимум и идёт с круглым шагом', () => {
    const ticks = niceTicks(0, 9_350_000, 5);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(9_350_000);
    const steps = ticks.slice(1).map((t, i) => t - ticks[i]);
    expect(new Set(steps).size).toBe(1); // равномерный шаг
  });

  it('не вырождается на нулевом диапазоне', () => {
    expect(niceTicks(0, 0)).toEqual([0, 0.5, 1]);
    expect(niceTicks(0, 0.4).at(-1)!).toBeGreaterThanOrEqual(0.4);
  });
});

describe('nearestIndex', () => {
  const pts = [{t: 0}, {t: 10}, {t: 20}, {t: 30}];
  it('снапится к ближайшей точке и к краям', () => {
    expect(nearestIndex(pts, 13)).toBe(1);
    expect(nearestIndex(pts, 16)).toBe(2);
    expect(nearestIndex(pts, -5)).toBe(0);
    expect(nearestIndex(pts, 99)).toBe(3);
    expect(nearestIndex([], 5)).toBe(-1);
  });
});

describe('demo data', () => {
  it('продажи: 3 серии × 24 выровненных месяца, значения > 0', () => {
    const data = makeSalesData();
    expect(data).toHaveLength(3);
    const t0 = data[0].points.map((p) => p.t);
    for (const s of data) {
      expect(s.points).toHaveLength(24);
      expect(s.points.map((p) => p.t)).toEqual(t0); // ряды выровнены (контракт виджета)
      for (const p of s.points) expect(p.v).toBeGreaterThan(0);
    }
  });

  it('мониторинг: одна шкала (все серии в %), плотный ряд', () => {
    const data = makeMonitoringData();
    expect(data).toHaveLength(3);
    for (const s of data) {
      expect(s.points.length).toBeGreaterThanOrEqual(5000);
      for (const p of s.points) {
        expect(p.v).toBeGreaterThanOrEqual(0);
        expect(p.v).toBeLessThanOrEqual(100);
      }
    }
  });

  it('детерминирована между вызовами', () => {
    expect(makeSalesData()).toEqual(makeSalesData());
    expect(makeMonitoringData()).toEqual(makeMonitoringData());
  });
});

describe('форматтеры и палитра', () => {
  it('подписи месяцев и оси', () => {
    expect(monthTick(Date.UTC(2024, 0, 1))).toBe('янв 24');
    expect(monthTick(Date.UTC(2024, 5, 1))).toBe('июн');
    expect(rubAxis(4_200_000)).toContain('млн');
  });

  it('слотов палитры хватает на лимит серий, дубликатов нет', () => {
    for (const mode of ['light', 'dark'] as const) {
      expect(PALETTES[mode].series.length).toBeGreaterThanOrEqual(MAX_SERIES);
      expect(new Set(PALETTES[mode].series).size).toBe(PALETTES[mode].series.length);
    }
  });
});
