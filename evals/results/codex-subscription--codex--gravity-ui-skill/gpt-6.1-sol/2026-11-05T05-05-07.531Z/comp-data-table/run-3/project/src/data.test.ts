import {describe, expect, it} from 'vitest';
import {findCustomers, initialCustomers, toCsv} from './data';

describe('customer table data', () => {
 it('sorts the entire dataset numerically before pagination', () => {
  const sorted = findCustomers(initialCustomers, '', '', '', [{column: 'revenue', order: 'desc'}]);
  expect(sorted.slice(0, 8).map(c => c.revenue)).toEqual(initialCustomers.map(c => c.revenue).sort((a, b) => b - a).slice(0, 8));
  expect(sorted.at(-1)?.revenue).toBe(Math.min(...initialCustomers.map(c => c.revenue)));
  expect(new Set(sorted.map(c => c.id)).size).toBe(initialCustomers.length);
 });
 it('combines case insensitive search with status and company filters', () => {
  const result = findCustomers(initialCustomers, '  АННА  ', 'active', 'Яндекс', []);
  expect(result.length).toBeGreaterThan(0);
  expect(result.every(c => c.name.includes('Анна') && c.status === 'active' && c.company === 'Яндекс')).toBe(true);
  expect(findCustomers(initialCustomers, 'Анна', 'inactive', '', [])).toEqual([]);
 });
 it('sorts dates chronologically and uses a secondary sort for equal values', () => {
  const result = findCustomers(initialCustomers, '', '', '', [{column: 'date', order: 'asc'}, {column: 'revenue', order: 'desc'}]);
  for (let i = 1; i < result.length; i++) {
   expect(result[i].date >= result[i-1].date).toBe(true);
   if (result[i].date === result[i-1].date) expect(result[i].revenue <= result[i-1].revenue).toBe(true);
  }
 });
 it('preserves input order and returns empty results when nothing matches', () => {
  const before = initialCustomers.map(c => c.id);
  findCustomers(initialCustomers, '', '', '', [{column: 'name', order: 'desc'}]);
  expect(initialCustomers.map(c => c.id)).toEqual(before);
  expect(findCustomers(initialCustomers, 'Несуществующий клиент', '', '', [])).toEqual([]);
 });
 it('escapes CSV cells and includes a BOM for Cyrillic in spreadsheet applications', () => {
  const csv = toCsv([{...initialCustomers[0], name: 'Анна "Тест"; новая'}]);
  expect(csv.startsWith('\uFEFF')).toBe(true);
  expect(csv).toContain('"Анна ""Тест""; новая"');
  expect(csv.split('\r\n')).toHaveLength(2);
  expect(toCsv([]).split('\r\n')).toHaveLength(1);
 });
});
