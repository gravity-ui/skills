import {describe, expect, it} from 'vitest';
import {getFilteredClients, initialClients, toCsv} from './data';

describe('client table data', () => {
  it('sorts the full result before pagination without changing source data', () => {
    const originalIds = initialClients.map(c => c.id);
    const sorted = getFilteredClients(initialClients, '', '', '', [{column:'name', order:'asc'}]);
    expect(sorted[9].name.localeCompare(sorted[10].name, 'ru')).toBeLessThanOrEqual(0);
    expect(sorted.map(c => c.name)).toEqual([...sorted.map(c => c.name)].sort((a,b) => a.localeCompare(b,'ru')));
    expect(initialClients.map(c => c.id)).toEqual(originalIds);
    expect(getFilteredClients(initialClients, '', '', '', [{column:'name', order:'desc'}])).toEqual([...sorted].reverse());
  });
  it('combines case-insensitive search with status and company filters', () => {
    const found = getFilteredClients(initialClients, '  АННА ', 'active', 'Яндекс', []);
    expect(found.map(c => c.name)).toEqual(['Анна Смирнова']);
    expect(getFilteredClients(initialClients, 'АННА', 'archived', '', [])).toEqual([]);
    expect(getFilteredClients(initialClients, 'tochka.com', '', '', []).length).toBe(8);
  });
  it('handles empty results and chronological sorting', () => {
    expect(getFilteredClients(initialClients, 'nonexistent', '', '', [])).toEqual([]);
    const sorted = getFilteredClients(initialClients, '', '', '', [{column:'created', order:'asc'}]);
    expect(Date.parse(sorted[0].created)).toBeLessThan(Date.parse(sorted.at(-1)!.created));
  });
  it('exports Russian CSV, quotes delimiters and neutralizes spreadsheet formulas', () => {
    const csv = toCsv([{...initialClients[0], name:'=1+1', company:'ООО "Тест"; Москва'}]);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"\'=1+1"');
    expect(csv).toContain('"ООО ""Тест""; Москва"');
    expect(csv.split('\r\n')).toHaveLength(2);
  });
});
