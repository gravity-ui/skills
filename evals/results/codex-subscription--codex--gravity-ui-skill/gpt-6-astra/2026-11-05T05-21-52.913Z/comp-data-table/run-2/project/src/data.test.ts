import {describe, expect, it} from 'vitest';
import {filterAndSort, initialClients, toCsv} from './data';

describe('client data operations', () => {
  it('sorts the entire dataset numerically before pagination without mutating the source', () => {
    const before = initialClients.map(c => c.id);
    const sorted = filterAndSort(initialClients, '', '', '', [{column: 'revenue', order: 'desc'}]);
    expect(sorted.slice(0, 8).map(c => c.revenue)).toEqual([128500, 128500, 128500, 128500, 84900, 84900, 84900, 84900]);
    expect(initialClients.map(c => c.id)).toEqual(before);
  });
  it('combines case-insensitive search with status and plan filters', () => {
    const results = filterAndSort(initialClients, '  яНДЕКС  ', 'active', 'Про', []);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(c => c.company === 'Яндекс' && c.status === 'active' && c.plan === 'Про')).toBe(true);
    expect(filterAndSort(initialClients, 'anna.smirnova@', '', '', [])).toHaveLength(1);
    expect(filterAndSort(initialClients, 'несуществующий клиент', '', '', [])).toEqual([]);
  });
  it('orders dates across months and supports secondary sorting', () => {
    const results = filterAndSort(initialClients, '', '', '', [{column: 'status', order: 'asc'}, {column: 'date', order: 'desc'}]);
    const active = results.filter(c => c.status === 'active');
    expect(active.map(c => c.date)).toEqual(active.map(c => c.date).sort().reverse());
    const oldestFirst = filterAndSort(initialClients, '', '', '', [{column: 'date', order: 'asc'}]);
    expect(oldestFirst[0].date).toBe('2026-09-04');
  });
  it('exports quoted Cyrillic CSV with formula protection and a UTF-8 BOM', () => {
    const csv = toCsv([{...initialClients[0], name: '=SUM(A1)', company: 'ООО "Тест"; Москва'}]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=SUM(A1)"');
    expect(csv).toContain('"ООО ""Тест""; Москва"');
    expect(csv.split('\r\n')).toHaveLength(2);
  });
});
