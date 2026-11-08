import React, { useMemo, useState } from 'react';
import {
  Table,
  TableColumnConfig,
  TableDataItem,
  Pagination,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
interface Person extends TableDataItem {
  id: string;
  name: string;
  age: number;
  city: string;
  email: string;
}

const ALL_DATA: Person[] = [
  { id: '1', name: 'Иван Петров', age: 28, city: 'Москва', email: 'ivan@example.com' },
  { id: '2', name: 'Ольга Смирнова', age: 34, city: 'Санкт-Петербург', email: 'olga@example.com' },
  { id: '3', name: 'Алексей Иванов', age: 22, city: 'Казань', email: 'alex@example.com' },
  { id: '4', name: 'Елена Кузнецова', age: 41, city: 'Новосибирск', email: 'elena@example.com' },
  { id: '5', name: 'Дмитрий Соколов', age: 30, city: 'Москва', email: 'dmitry@example.com' },
  { id: '6', name: 'Анна Попова', age: 26, city: 'Екатеринбург', email: 'anna@example.com' },
  { id: '7', name: 'Сергей Волков', age: 45, city: 'Москва', email: 'sergey@example.com' },
  { id: '8', name: 'Мария Морозова', age: 29, city: 'Краснодар', email: 'maria@example.com' },
  { id: '9', name: 'Павел Лебедев', age: 37, city: 'Челябинск', email: 'pavel@example.com' },
  { id: '10', name: 'Татьяна Козлова', age: 32, city: 'Самара', email: 'tatiana@example.com' },
  { id: '11', name: 'Николай Новиков', age: 39, city: 'Уфа', email: 'nikolay@example.com' },
  { id: '12', name: 'Юлия Федорова', age: 24, city: 'Волгоград', email: 'yulia@example.com' },
];

// ---------------------------------------------------------------------------
// Composed table – sorting + selection
// ---------------------------------------------------------------------------
const DataTable = withTableSelection(withTableSorting(Table<Person>));

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
const COLUMNS: TableColumnConfig<Person>[] = [
  {
    id: 'name',
    name: 'Имя',
    meta: { sort: true },
  },
  {
    id: 'age',
    name: 'Возраст',
    width: 100,
    align: 'center',
    meta: { sort: true },
  },
  {
    id: 'city',
    name: 'Город',
    meta: { sort: true },
  },
  {
    id: 'email',
    name: 'Email',
  },
];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<{ column: string; order: 'asc' | 'desc' }[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return ALL_DATA.slice(start, start + pageSize);
  }, [page]);

  return (
    <div style={{ padding: 24, maxWidth: 780 }}>
      <DataTable
        data={paginatedData}
        columns={COLUMNS}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={setSortState}
        edgePadding
        verticalAlign="middle"
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={ALL_DATA.length}
        onUpdate={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
