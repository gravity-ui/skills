import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash, routes } from './router';

describe('parseHash', () => {
  it('пустой hash ведёт на главную', () => {
    expect(parseHash('')).toBe(routes.home);
    expect(parseHash('#')).toBe(routes.home);
    expect(parseHash('#/')).toBe(routes.home);
  });

  it('распознаёт известные маршруты', () => {
    expect(parseHash('#/about')).toBe(routes.about);
    expect(parseHash('#/settings')).toBe(routes.settings);
  });

  it('неизвестный путь ведёт на главную', () => {
    expect(parseHash('#/nope')).toBe(routes.home);
  });

  it('hrefFor и parseHash согласованы', () => {
    for (const route of Object.values(routes)) {
      expect(parseHash(hrefFor(route))).toBe(route);
    }
  });
});
