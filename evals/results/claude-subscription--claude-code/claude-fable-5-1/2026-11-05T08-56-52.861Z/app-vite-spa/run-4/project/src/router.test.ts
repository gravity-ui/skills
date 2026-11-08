import { describe, expect, it } from 'vitest';
import { hrefFor, parseHash } from './router';

describe('parseHash', () => {
  it('пустой хэш ведёт на главную', () => {
    expect(parseHash('')).toBe('/');
    expect(parseHash('#')).toBe('/');
    expect(parseHash('#/')).toBe('/');
  });

  it('распознаёт известные маршруты', () => {
    expect(parseHash('#/about')).toBe('/about');
    expect(parseHash('#/settings')).toBe('/settings');
  });

  it('терпим к отсутствию слэша и завершающему слэшу', () => {
    expect(parseHash('#about')).toBe('/about');
    expect(parseHash('#/settings/')).toBe('/settings');
  });

  it('неизвестный путь возвращает null', () => {
    expect(parseHash('#/nope')).toBeNull();
  });

  it('hrefFor обратим через parseHash', () => {
    expect(parseHash(hrefFor('/about'))).toBe('/about');
  });
});
