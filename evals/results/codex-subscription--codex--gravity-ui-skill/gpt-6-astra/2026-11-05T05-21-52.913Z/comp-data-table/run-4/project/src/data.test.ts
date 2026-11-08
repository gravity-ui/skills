import {describe, expect, it} from 'vitest';
import {initialClients, prepareClients, csvForClients} from './data';

describe('client registry', () => {
  it('sorts the entire result before slicing a page, including numeric values', () => {
    const sorted = prepareClients(initialClients, '', '', '', 'all', [{column: 'revenue', order: 'desc'}]);
    expect(sorted[0].revenue).toBe(Math.max(...initialClients.filter(c => !c.archived).map(c => c.revenue)));
    const page2 = sorted.slice(10, 20);
    expect(page2).toHaveLength(10);
    expect(sorted[9].revenue).toBeGreaterThanOrEqual(page2[0].revenue);
    expect(new Set(sorted.map(c => c.id)).size).toBe(sorted.length);
  });
  it('matches Cyrillic names and companies case-insensitively with combined filters', () => {
    const found = prepareClients(initialClients, '  ПЕТРОВ  ', 'Активен', 'Бизнес', 'all', []);
    expect(found.length).toBeGreaterThan(0);
    expect(found.every(c => c.name.includes('Петров') && c.status === 'Активен' && c.plan === 'Бизнес')).toBe(true);
    expect(prepareClients(initialClients, 'ЯНДЕКС', '', '', 'all', []).length).toBeGreaterThan(0);
    expect(prepareClients(initialClients, 'not-found', '', '', 'all', [])).toHaveLength(0);
  });
  it('keeps archived clients out of the main and active views', () => {
    expect(prepareClients(initialClients, '', '', '', 'all', [])).toHaveLength(120);
    const archive = prepareClients(initialClients, '', '', '', 'archive', []);
    expect(archive).toHaveLength(8);
    expect(archive.every(c => c.archived)).toBe(true);
    expect(prepareClients(initialClients, '', '', '', 'active', []).every(c => !c.archived && c.status === 'Активен')).toBe(true);
  });
  it('uses the second sort key when the first is equal and restores original order', () => {
    const data = initialClients.slice(0, 3).map((c, i) => ({...c, company: 'Компания', revenue: [10, 100, 50][i]}));
    expect(prepareClients(data, '', '', '', 'all', [{column: 'company', order: 'asc'}, {column: 'revenue', order: 'desc'}]).map(c => c.revenue)).toEqual([100, 50, 10]);
    expect(prepareClients(data, '', '', '', 'all', []).map(c => c.id)).toEqual(data.map(c => c.id));
  });
  it('produces a Cyrillic-compatible CSV and escapes quotes and spreadsheet formulas', () => {
    const csv = csvForClients([{...initialClients[0], name: '=1+1', company: 'Компания "А";Б'}]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"Компания ""А"";Б"');
    expect(csv.split('\r\n')).toHaveLength(2);
  });
});
