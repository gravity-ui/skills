import {describe, expect, it} from 'vitest';

import {formatAxis, formatValue, niceScale} from './format';
import {computeColumnRanges} from './engines/monitoringSeries';
import {demoModes} from '../demoData';

describe('niceScale', () => {
  it('покрывает максимум круглыми тиками от нуля', () => {
    const {domainMax, ticks} = niceScale(2_070_000, 5);
    expect(domainMax).toBeGreaterThanOrEqual(2_070_000);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBe(domainMax);
    for (let i = 1; i < ticks.length; i++) {
      expect(ticks[i]).toBeGreaterThan(ticks[i - 1]);
    }
  });

  it('не падает на нулевых данных', () => {
    expect(niceScale(0).domainMax).toBe(1);
  });
});

describe('formatAxis / formatValue', () => {
  it('до 10 000 — полностью, выше — компактно', () => {
    expect(formatAxis(2500)).toContain('2');
    expect(formatAxis(9999)).not.toContain('тыс');
    expect(formatAxis(15000)).toContain('тыс');
    expect(formatAxis(2_500_000)).toContain('млн');
  });

  it('присоединяет единицу измерения', () => {
    expect(formatValue(120, 'мс')).toBe('120 мс');
    expect(formatValue(1_900_000, '₽')).toContain('₽');
  });
});

describe('computeColumnRanges', () => {
  it('сохраняет min и max колонки (выбросы не теряются)', () => {
    const values = [10, 12, 250, 11, 9, 13];
    expect(computeColumnRanges(values, 0, 5)).toEqual({min: 9, max: 250});
    expect(computeColumnRanges(values, 2, 2)).toEqual({min: 250, max: 250});
  });

  it('корректно обрабатывает выход за границы', () => {
    expect(computeColumnRanges([1, 2, 3], -5, 100)).toEqual({min: 1, max: 3});
    expect(computeColumnRanges([], 0, 5)).toBeNull();
  });
});

describe('demoModes', () => {
  it('длины рядов совпадают с осью времени, p95 >= p50', () => {
    for (const config of Object.values(demoModes)) {
      for (const s of config.series) {
        expect(s.values.length).toBe(config.times.length);
      }
    }
    const mon = demoModes.monitoring;
    const [p50, p95] = mon.series;
    for (let i = 0; i < mon.times.length; i += 137) {
      expect(p95.values[i]).toBeGreaterThanOrEqual(p50.values[i]);
    }
  });

  it('плотный ряд имеет агрегированный табличный вид', () => {
    expect(demoModes.monitoring.tableRows).toHaveLength(24);
  });
});
