import {describe, expect, it} from 'vitest';
import {filterAndSort, initialClients, type ClientFilters} from './clients';

const all: ClientFilters = {query: '', status: 'all', city: 'all', month: 'all'};

describe('Client list', () => {
  it('sorts the entire dataset numerically before pagination', () => {
    const sorted = filterAndSort(initialClients, all, [{column: 'revenue', order: 'desc'}]);
    expect(sorted).toHaveLength(48);
    expect(sorted[0].revenue).toBe(Math.max(...initialClients.map(c => c.revenue)));
    const firstPage = sorted.slice(0, 10);
    const secondPage = sorted.slice(10, 20);
    expect(firstPage.at(-1)!.revenue).toBeGreaterThanOrEqual(secondPage[0].revenue);
    expect(new Set([...firstPage, ...secondPage].map(c => c.id)).size).toBe(20);
  });

  it('combines case-insensitive search, status, city and month filters', () => {
    const result = filterAndSort(initialClients, {...all, query: ' ЯНДЕКС ', status: 'active', city: 'Москва', month: '2026-11'}, []);
    expect(result.map(c => c.name)).toEqual(['Анна Смирнова']);
    expect(filterAndSort(initialClients, {...all, query: 'ANNA.SMIRNOVA@'}, [])).toHaveLength(1);
  });

  it('returns empty results without changing the source dataset', () => {
    const originalIds = initialClients.map(c => c.id);
    expect(filterAndSort(initialClients, {...all, query: 'несуществующий клиент'}, [])).toEqual([]);
    filterAndSort(initialClients, all, [{column: 'name', order: 'asc'}]);
    expect(initialClients.map(c => c.id)).toEqual(originalIds);
  });

  it('uses secondary sorting for equal primary values', () => {
    const sorted = filterAndSort(initialClients, all, [{column: 'company', order: 'asc'}, {column: 'revenue', order: 'desc'}]);
    const yandex = sorted.filter(c => c.company === 'Яндекс');
    expect(yandex).toHaveLength(3);
    expect(yandex.map(c => c.revenue)).toEqual(yandex.map(c => c.revenue).sort((a, b) => b - a));
    expect(filterAndSort(initialClients, all, [])).toEqual(initialClients);
  });
});
