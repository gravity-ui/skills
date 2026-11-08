import {describe, expect, it} from 'vitest';

import {alignToTimeline} from './timeline';
import {formatValue, lastValue} from './format';
import type {ChartSeries} from './types';

describe('alignToTimeline', () => {
  it('keeps identical time grids unchanged', () => {
    const series: ChartSeries[] = [
      {id: 'a', name: 'A', points: [{x: 10, y: 1}, {x: 20, y: 2}]},
      {id: 'b', name: 'B', points: [{x: 10, y: 3}, {x: 20, y: 4}]},
    ];
    const {timeline, values} = alignToTimeline(series);
    expect(timeline).toEqual([10, 20]);
    expect(values.get('a')).toEqual([1, 2]);
    expect(values.get('b')).toEqual([3, 4]);
  });

  it('builds a sorted union and fills missing points with null', () => {
    const series: ChartSeries[] = [
      {id: 'a', name: 'A', points: [{x: 30, y: 3}, {x: 10, y: 1}]},
      {id: 'b', name: 'B', points: [{x: 20, y: 2}]},
    ];
    const {timeline, values} = alignToTimeline(series);
    expect(timeline).toEqual([10, 20, 30]);
    expect(values.get('a')).toEqual([1, null, 3]);
    expect(values.get('b')).toEqual([null, 2, null]);
  });

  it('keeps explicit null values as gaps', () => {
    const series: ChartSeries[] = [{id: 'a', name: 'A', points: [{x: 1, y: null}, {x: 2, y: 5}]}];
    expect(alignToTimeline(series).values.get('a')).toEqual([null, 5]);
  });
});

describe('lastValue', () => {
  it('returns the y of the point with the largest x, ignoring gaps', () => {
    expect(lastValue([{x: 2, y: 20}, {x: 3, y: null}, {x: 1, y: 5}])).toBe(20);
  });

  it('returns null when there is no value', () => {
    expect(lastValue([])).toBeNull();
    expect(lastValue([{x: 1, y: null}])).toBeNull();
  });
});

describe('formatValue', () => {
  it('formats with a ru-RU locale and appends the unit', () => {
    // ru-RU использует неразрывный пробел как разделитель тысяч
    expect(formatValue(2222.4, 'тыс. ₽')).toBe('2 222,4 тыс. ₽');
  });

  it('omits the unit when none is given', () => {
    expect(formatValue(42)).toBe('42');
  });
});
