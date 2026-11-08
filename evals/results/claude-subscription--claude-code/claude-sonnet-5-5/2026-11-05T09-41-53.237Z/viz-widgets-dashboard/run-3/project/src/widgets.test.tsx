import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RANGES, sliceRange } from './data';
import { niceTicks } from './format';
import { DEFAULT_LAYOUT, WIDGETS } from './registry';
import { collides, isValidLayout } from './layout';

describe('widgets', () => {
  it('default layout is valid and covers every widget', () => {
    expect(isValidLayout(DEFAULT_LAYOUT, WIDGETS.map((w) => w.id))).toBe(true);
    expect(DEFAULT_LAYOUT.length).toBe(WIDGETS.length);
    expect(DEFAULT_LAYOUT.some((a) => DEFAULT_LAYOUT.some((b) => collides(a, b)))).toBe(false);
  });

  it('default sizes respect each widget\'s limits', () => {
    for (const w of WIDGETS) {
      const i = DEFAULT_LAYOUT.find((d) => d.id === w.id)!;
      expect(i.w).toBeGreaterThanOrEqual(w.limits.minW);
      expect(i.h).toBeGreaterThanOrEqual(w.limits.minH);
    }
  });

  for (const range of RANGES) {
    it(`every widget renders for a ${range}-day range`, () => {
      const data = sliceRange(range);
      expect(data.previous.length).toBe(range);
      for (const w of WIDGETS) {
        const html = renderToString(<>{w.render(data)}</>);
        expect(html.length, w.id).toBeGreaterThan(50);
        expect(html, w.id).not.toMatch(/NaN|undefined|Infinity/);
      }
    });
  }

  it('niceTicks covers the data range', () => {
    const t = niceTicks(11234, 15876, 4);
    expect(t[0]).toBeLessThanOrEqual(11234);
    expect(t[t.length - 1]).toBeGreaterThanOrEqual(15876);
  });
});
