import { useMemo, useState } from 'react';
import {
  Button,
  Label,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type { LabelProps, TableColumnConfig, TableSortState } from '@gravity-ui/uikit';

import type { Status, User } from './data';

// Сортировка внешняя (по всему набору данных, до разбиения на страницы),
// поэтому HOC сортировки используется только для заголовков и состояния.
const SelectableSortableTable = withTableSorting(withTableSelection(Table<User>));

const STATUS_LABEL: Record<Status, { text: string; theme: LabelProps['theme'] }> = {
  active: { text: 'Активен', theme: 'success' },
  pending: { text: 'Ожидает', theme: 'warning' },
  blocked: { text: 'Заблокирован', theme: 'danger' },
};

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

function compare(a: User, b: User, column: string): number {
  const x = a[column as keyof User];
  const y = b[column as keyof User];
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return collator.compare(String(x), String(y));
}

const COLUMNS: TableColumnConfig<User>[] = [
  { id: 'name', name: 'Имя', meta: { sort: true } },
  { id: 'email', name: 'Email', meta: { sort: true } },
  { id: 'role', name: 'Роль', meta: { sort: true } },
  {
    id: 'status',
    name: 'Статус',
    meta: { sort: true },
    template: (u) => (
      <Label theme={STATUS_LABEL[u.status].theme}>{STATUS_LABEL[u.status].text}</Label>
    ),
  },
  { id: 'score', name: 'Рейтинг', align: 'end', meta: { sort: true, defaultSortOrder: 'desc' } },
  {
    id: 'createdAt',
    name: 'Создан',
    meta: { sort: true },
    template: (u) => new Date(u.createdAt).toLocaleDateString('ru-RU'),
  },
];

const PAGE_SIZES = [5, 10, 20];

export function UsersTable({ data }: { data: User[] }) {
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sorted = useMemo(() => {
    if (sortState.length === 0) return data;
    return data.slice().sort((a, b) => {
      for (const { column, order } of sortState) {
        const result = compare(a, b, column);
        if (result !== 0) return order === 'asc' ? result : -result;
      }
      return 0;
    });
  }, [data, sortState]);

  const pageItems = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 28 }}>
        <Text variant="body-2" color="secondary">
          Выбрано: {selectedIds.length} из {data.length}
        </Text>
        {selectedIds.length > 0 && (
          <Button view="flat" size="s" onClick={() => setSelectedIds([])}>
            Снять выделение
          </Button>
        )}
      </div>

      <SelectableSortableTable
        data={pageItems}
        columns={COLUMNS}
        getRowDescriptor={(u) => ({ id: u.id })}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortState={sortState}
        onSortStateChange={(next) => {
          setSortState(next);
          setPage(1);
        }}
        emptyMessage="Нет данных"
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={sorted.length}
        pageSizeOptions={PAGE_SIZES}
        onUpdate={(nextPage, nextSize) => {
          setPage(nextSize === pageSize ? nextPage : 1);
          setPageSize(nextSize);
        }}
      />
    </div>
  );
}
