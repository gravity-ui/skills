import {describe, expect, it} from 'vitest';
import {csvContent, filterAndSort, initialEmployees} from './data';

describe('employee directory data', () => {
 it('sorts the whole dataset before pagination without mutating the source', () => {
  const originalIds = initialEmployees.map(e => e.id);
  const sorted = filterAndSort(initialEmployees, '', '', '', [{column:'name',order:'asc'}]);
  expect(sorted).toHaveLength(48);
  for(let i=1;i<sorted.length;i++) expect(sorted[i-1].name.localeCompare(sorted[i].name,'ru')).toBeLessThanOrEqual(0);
  expect(initialEmployees.map(e=>e.id)).toEqual(originalIds);
  expect(sorted.slice(8,16)).toHaveLength(8);
 });
 it('combines trimmed case-insensitive search with department and status filters', () => {
  const result=filterAndSort(initialEmployees,'  АННА  ','Дизайн','Активен',[]);
  expect(result.map(e=>e.name)).toEqual(['Анна Смирнова']);
  expect(filterAndSort(initialEmployees,'АННА','Разработка','Активен',[])).toEqual([]);
 });
 it('sorts dates descending and returns an empty list for no matches', () => {
  const result=filterAndSort(initialEmployees,'','','',[{column:'date',order:'desc'}]);
  expect(result[0].date).toBe([...initialEmployees].map(e=>e.date).sort().at(-1));
  expect(filterAndSort(initialEmployees,'несуществующий сотрудник','','',[])).toEqual([]);
 });
 it('exports UTF-8 CSV, escaping quotes and preventing spreadsheet formula execution', () => {
  const csv=csvContent([{...initialEmployees[0],name:'=HYPERLINK("test")'}]);
  expect(csv.startsWith('\uFEFF')).toBe(true);
  expect(csv).toContain('"\'=HYPERLINK(""test"")"');
  expect(csv.split('\r\n')).toHaveLength(2);
 });
 it('provides stable unique row identities for selection across pages', () => {
  expect(new Set(initialEmployees.map(e=>e.id)).size).toBe(initialEmployees.length);
  const selected = new Set(initialEmployees.slice(0,8).map(e=>e.id));
  const sorted=filterAndSort(initialEmployees,'','','',[{column:'name',order:'desc'}]);
  expect(sorted.filter(e=>selected.has(e.id))).toHaveLength(8);
 });
});
