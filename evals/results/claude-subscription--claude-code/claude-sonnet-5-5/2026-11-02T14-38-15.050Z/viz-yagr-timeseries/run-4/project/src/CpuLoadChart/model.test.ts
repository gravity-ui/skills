import {describe, expect, it} from 'vitest';

import {planAppend, reconcileZoom, sanitizeSamples, toZoom} from './model';

describe('planAppend', () => {
  it('растёт, пока окно не заполнено', () => {
    expect(planAppend(10, 5, 100)).toEqual({grow: 5, rotate: 0});
  });

  it('в заполненном окне только сдвигается', () => {
    expect(planAppend(100, 5, 100)).toEqual({grow: 0, rotate: 5});
  });

  it('на границе делит батч на рост и сдвиг', () => {
    expect(planAppend(98, 5, 100)).toEqual({grow: 2, rotate: 3});
  });

  it('итоговая длина никогда не превышает ёмкость', () => {
    for (const [len, n] of [[0, 7], [3, 7], [7, 7], [9, 1], [10, 10]]) {
      const {grow, rotate} = planAppend(len, n, 10);
      expect(grow + rotate).toBe(n);
      expect(Math.min(10, len + n)).toBe(len + grow);
    }
  });
});

describe('sanitizeSamples', () => {
  it('отбрасывает дубликаты, прошлое и невалидное время', () => {
    const {timeline} = sanitizeSamples(
      [
        {t: 5, v: 1},
        {t: 10, v: 2},
        {t: 10, v: 3},
        {t: 9, v: 4},
        {t: NaN, v: 5},
        {t: 11, v: 6},
      ],
      5,
    );
    expect(timeline).toEqual([10, 11]);
  });

  it('ограничивает значения 0..100 и превращает нечисла в null', () => {
    const {values} = sanitizeSamples(
      [
        {t: 1, v: -5},
        {t: 2, v: 150},
        {t: 3, v: NaN},
        {t: 4, v: null},
        {t: 5, v: 42.5},
      ],
      0,
    );
    expect(values).toEqual([0, 100, null, null, 42.5]);
  });
});

describe('zoom', () => {
  it('полный диапазон — не зум', () => {
    expect(toZoom(0, 100, 0, 100)).toBeNull();
    expect(toZoom(-10, 110, 0, 100)).toBeNull();
    expect(toZoom(20, 40, 0, 100)).toEqual({min: 20, max: 40});
  });

  it('зум обрезается или сбрасывается, когда окно уходит вперёд', () => {
    expect(reconcileZoom(null, 0)).toBeNull();
    expect(reconcileZoom({min: 20, max: 40}, 10)).toEqual({min: 20, max: 40});
    expect(reconcileZoom({min: 20, max: 40}, 30)).toEqual({min: 30, max: 40});
    expect(reconcileZoom({min: 20, max: 40}, 40)).toBeNull();
  });
});
