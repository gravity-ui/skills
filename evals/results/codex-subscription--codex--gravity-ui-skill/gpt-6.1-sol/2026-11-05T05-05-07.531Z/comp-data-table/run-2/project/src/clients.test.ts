import {describe, expect, it} from 'vitest';
import {createClients, filterAndSortClients, type Client} from './clients';

const clients: Client[] = [
  {id: '1', name: 'Яна Орлова', role: 'Директор', company: 'Яндекс', email: 'yana@example.ru', status: 'active', createdAt: '2026-11-02T12:00:00Z'},
  {id: '2', name: 'Анна Белова', role: 'Менеджер', company: 'Ozon', email: 'anna@example.ru', status: 'inactive', createdAt: '2026-11-05T12:00:00Z'},
  {id: '3', name: 'Анна Алексеева', role: 'Дизайнер', company: 'Яндекс', email: 'designer@example.ru', status: 'active', createdAt: '2026-11-03T12:00:00Z'},
];

describe('Клиентская база', () => {
  it('сортирует всю базу до разбиения на страницы', () => {
    const sorted = filterAndSortClients(clients, {query: '', status: 'all', sortState: [{column: 'name', order: 'asc'}]});
    expect(sorted.slice(0, 2).map((c) => c.name)).toEqual(['Анна Алексеева', 'Анна Белова']);
    expect(sorted.slice(2).map((c) => c.name)).toEqual(['Яна Орлова']);
    expect(clients[0].name).toBe('Яна Орлова');
  });

  it('меняет направление сортировки даты', () => {
    expect(filterAndSortClients(clients, {query: '', status: 'all', sortState: [{column: 'createdAt', order: 'desc'}]}).map((c) => c.id)).toEqual(['2', '3', '1']);
  });

  it('одновременно применяет поиск без учёта регистра, компанию и статус', () => {
    expect(filterAndSortClients(clients, {query: '  АННА   дизайнер ', status: 'active', company: 'Яндекс', sortState: []}).map((c) => c.id)).toEqual(['3']);
    expect(filterAndSortClients(clients, {query: 'example.ru', status: 'inactive', company: 'Ozon', sortState: []}).map((c) => c.id)).toEqual(['2']);
  });

  it('поддерживает дополнительную колонку сортировки', () => {
    expect(filterAndSortClients(clients, {query: '', status: 'all', sortState: [{column: 'company', order: 'asc'}, {column: 'createdAt', order: 'desc'}]}).map((c) => c.id)).toEqual(['3', '1', '2']);
  });

  it('возвращает пустой результат для отсутствующих данных', () => {
    expect(filterAndSortClients(clients, {query: 'несуществующий клиент', status: 'all', sortState: []})).toEqual([]);
    expect(filterAndSortClients([], {query: '', status: 'all', sortState: []})).toEqual([]);
  });

  it('создаёт 128 записей с уникальными идентификаторами и корректными датами', () => {
    const demo = createClients();
    expect(demo).toHaveLength(128);
    expect(new Set(demo.map((c) => c.id)).size).toBe(128);
    expect(demo.every((c) => Number.isFinite(Date.parse(c.createdAt)))).toBe(true);
  });
});
