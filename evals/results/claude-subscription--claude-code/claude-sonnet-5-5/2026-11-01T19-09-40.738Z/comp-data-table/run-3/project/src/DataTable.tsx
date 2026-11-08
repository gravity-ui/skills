import React from 'react';
import {
  Button,
  Flex,
  Label,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type { TableColumnConfig, TableSortState } from '@gravity-ui/uikit';

export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'blocked';
  age: number;
  createdAt: string; // ISO date
}

const STATUS_THEME = {
  active: 'success',
  pending: 'warning',
  blocked: 'danger',
} as const;

const SortableSelectableTable = withTableSelection(withTableSorting(Table<Person>));

const compare = (a: string | number, b: string | number) => (a === b ? 0 : a > b ? 1 : -1);

const columns: TableColumnConfig<Person>[] = [
  { id: 'name', name: 'Имя', meta: { sort: true }, primary: true },
  { id: 'email', name: 'Email', meta: { sort: true } },
  { id: 'role', name: 'Роль', meta: { sort: true } },
  {
    id: 'status',
    name: 'Статус',
    meta: { sort: true },
    template: (item) => <Label theme={STATUS_THEME[item.status]}>{item.status}</Label>,
  },
  { id: 'age', name: 'Возраст', align: 'end', meta: { sort: true } },
  {
    id: 'createdAt',
    name: 'Создан',
    meta: { sort: true, defaultSortOrder: 'desc' },
    template: (item) => new Date(item.createdAt).toLocaleDateString('ru-RU'),
  },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function DataTable({ data }: { data: Person[] }) {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  // Выделение хранится по id, поэтому сохраняется при смене страницы и сортировки.
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Сортировка применяется ко всему набору данных, затем берётся срез страницы.
  const sorted = React.useMemo(() => {
    if (sortState.length === 0) return data;
    return data.slice().sort((a, b) => {
      for (const { column, order } of sortState) {
        const key = column as keyof Person;
        const result = compare(a[key], b[key]);
        if (result !== 0) return order === 'asc' ? result : -result;
      }
      return 0;
    });
  }, [data, sortState]);

  const pageItems = React.useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const handleSortChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(pageSize === nextPageSize ? nextPage : 1);
    setPageSize(nextPageSize);
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" gap={3} style={{ minHeight: 28 }}>
        <Text variant="subheader-2">Выбрано: {selectedIds.length}</Text>
        {selectedIds.length > 0 && (
          <Button view="flat" size="s" onClick={() => setSelectedIds([])}>
            Снять выделение
          </Button>
        )}
      </Flex>

      <SortableSelectableTable
        data={pageItems}
        columns={columns}
        getRowId="id"
        sortState={sortState}
        onSortStateChange={handleSortChange}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage="Нет данных"
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={sorted.length}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onUpdate={handlePaginationUpdate}
      />
    </Flex>
  );
}
