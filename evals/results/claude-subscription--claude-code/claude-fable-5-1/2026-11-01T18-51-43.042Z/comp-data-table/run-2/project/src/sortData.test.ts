import { describe, expect, it } from 'vitest';

import { sortData } from './sortData';
import type { DataTableColumn } from './sortData';
import { generateEmployees } from './data';
import type { Employee } from './data';

const columns: DataTableColumn<Employee>[] = [
  { id: 'name', meta: { sort: true } },
  { id: 'department', meta: { sort: true } },
  { id: 'salary', meta: { sort: true } },
  { id: 'hiredAt', meta: { sort: true } },
  { id: 'position' }, // не сортируемая
  { id: 'status', meta: { sort: (a, b) => a.status.localeCompare(b.status) } },
];

const data = generateEmployees(57);

describe('sortData', () => {
  it('возвращает исходный массив без сортировки', () => {
    expect(sortData(data, [], columns)).toBe(data);
    expect(sortData(data, [{ column: 'position', order: 'asc' }], columns)).toBe(data);
  });

  it('не мутирует исходные данные', () => {
    const copy = [...data];
    sortData(data, [{ column: 'salary', order: 'desc' }], columns);
    expect(data).toEqual(copy);
  });

  it('сортирует числа по значению, а не как строки', () => {
    const rows = [{ id: 1, salary: 100 }, { id: 2, salary: 20 }, { id: 3, salary: 3 }];
    const cols: DataTableColumn<(typeof rows)[number]>[] = [{ id: 'salary', meta: { sort: true } }];
    expect(sortData(rows, [{ column: 'salary', order: 'asc' }], cols).map((r) => r.id)).toEqual([3, 2, 1]);
    expect(sortData(rows, [{ column: 'salary', order: 'desc' }], cols).map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('сортирует кириллицу с учётом локали и регистра', () => {
    const rows = [{ n: 'яблоко' }, { n: 'Ёж' }, { n: 'арбуз' }, { n: 'Ель' }];
    const cols: DataTableColumn<(typeof rows)[number]>[] = [{ id: 'n', meta: { sort: true } }];
    expect(sortData(rows, [{ column: 'n', order: 'asc' }], cols).map((r) => r.n)).toEqual([
      'арбуз',
      'Ёж',
      'Ель',
      'яблоко',
    ]);
  });

  it('ставит пустые значения в конец независимо от направления по основному полю', () => {
    const rows = [{ v: 'b' }, { v: null }, { v: 'a' }, { v: undefined }];
    const cols: DataTableColumn<(typeof rows)[number]>[] = [{ id: 'v', meta: { sort: true } }];
    expect(sortData(rows, [{ column: 'v', order: 'asc' }], cols).map((r) => r.v)).toEqual(['a', 'b', null, undefined]);
  });

  it('применяет пользовательский компаратор и направление', () => {
    const asc = sortData(data, [{ column: 'status', order: 'asc' }], columns).map((r) => r.status);
    const desc = sortData(data, [{ column: 'status', order: 'desc' }], columns).map((r) => r.status);
    expect(asc).toEqual([...asc].sort());
    expect(desc).toEqual([...asc].reverse());
  });

  it('поддерживает многоколоночную сортировку', () => {
    const sorted = sortData(
      data,
      [
        { column: 'department', order: 'asc' },
        { column: 'salary', order: 'desc' },
      ],
      columns,
    );
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      const byDepartment = prev.department.localeCompare(cur.department, undefined, { sensitivity: 'base' });
      expect(byDepartment).toBeLessThanOrEqual(0);
      if (byDepartment === 0) expect(prev.salary).toBeGreaterThanOrEqual(cur.salary);
    }
  });

  it('стабильна: равные элементы сохраняют исходный порядок', () => {
    const sorted = sortData(data, [{ column: 'department', order: 'asc' }], columns);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].department === sorted[i].department) {
        expect(sorted[i - 1].id).toBeLessThan(sorted[i].id);
      }
    }
  });

  it('сортирует ISO-даты хронологически', () => {
    const sorted = sortData(data, [{ column: 'hiredAt', order: 'asc' }], columns);
    for (let i = 1; i < sorted.length; i++) {
      expect(Date.parse(sorted[i - 1].hiredAt)).toBeLessThanOrEqual(Date.parse(sorted[i].hiredAt));
    }
  });
});

describe('generateEmployees', () => {
  it('детерминирован и выдаёт уникальные id', () => {
    const a = generateEmployees(20);
    const b = generateEmployees(20);
    expect(a).toEqual(b);
    expect(new Set(a.map((e) => e.id)).size).toBe(20);
  });
});
