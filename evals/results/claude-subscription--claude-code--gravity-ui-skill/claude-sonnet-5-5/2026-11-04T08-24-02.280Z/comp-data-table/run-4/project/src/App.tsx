import React from 'react';
import {
  Flex,
  Label,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  salary: number;
  status: 'active' | 'vacation' | 'dismissed';
}

const DEPARTMENTS = ['Разработка', 'Дизайн', 'Аналитика', 'Маркетинг', 'Поддержка'];
const ROLES = ['Инженер', 'Старший инженер', 'Руководитель', 'Специалист', 'Стажёр'];
const STATUSES: Employee['status'][] = ['active', 'vacation', 'dismissed'];
const FIRST_NAMES = ['Анна', 'Иван', 'Мария', 'Пётр', 'Елена', 'Дмитрий', 'Ольга', 'Сергей'];
const LAST_NAMES = ['Иванов', 'Петрова', 'Сидоров', 'Кузнецова', 'Смирнов', 'Попова', 'Волков'];

// Детерминированные данные, чтобы таблица не «прыгала» между перезагрузками.
const DATA: Employee[] = Array.from({length: 87}, (_, i) => ({
  id: String(i + 1),
  name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[(i * 3) % LAST_NAMES.length]}`,
  department: DEPARTMENTS[(i * 7) % DEPARTMENTS.length],
  role: ROLES[(i * 5) % ROLES.length],
  salary: 60000 + ((i * 7919) % 140) * 1000,
  status: STATUSES[(i * 11) % STATUSES.length],
}));

const STATUS_VIEW: Record<
  Employee['status'],
  {text: string; theme: 'success' | 'info' | 'danger'}
> = {
  active: {text: 'Работает', theme: 'success'},
  vacation: {text: 'В отпуске', theme: 'info'},
  dismissed: {text: 'Уволен', theme: 'danger'},
};

const collator = new Intl.Collator('ru');
const compareText = (field: keyof Employee) => (a: Employee, b: Employee) =>
  collator.compare(String(a[field]), String(b[field]));
const compareNumber = (field: keyof Employee) => (a: Employee, b: Employee) =>
  Number(a[field]) - Number(b[field]);

const SORTERS: Record<string, (a: Employee, b: Employee) => number> = {
  id: compareNumber('id'),
  name: compareText('name'),
  department: compareText('department'),
  role: compareText('role'),
  salary: compareNumber('salary'),
  status: (a, b) => compareText('status')(a, b),
};

const columns: TableColumnConfig<Employee>[] = [
  {id: 'id', name: '№', width: 70, meta: {sort: SORTERS.id}},
  {id: 'name', name: 'Сотрудник', primary: true, meta: {sort: SORTERS.name}},
  {id: 'department', name: 'Отдел', meta: {sort: SORTERS.department}},
  {id: 'role', name: 'Должность', meta: {sort: SORTERS.role}},
  {
    id: 'salary',
    name: 'Зарплата, ₽',
    align: 'end',
    meta: {sort: SORTERS.salary, defaultSortOrder: 'desc'},
    template: (item) => item.salary.toLocaleString('ru-RU'),
  },
  {
    id: 'status',
    name: 'Статус',
    meta: {sort: SORTERS.status},
    template: (item) => (
      <Label theme={STATUS_VIEW[item.status].theme}>{STATUS_VIEW[item.status].text}</Label>
    ),
  },
];

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Employee>));

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const getRowDescriptor = (item: Employee) => ({id: item.id});

export function App() {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Сортируем весь набор данных, а не только текущую страницу.
  const sortedData = React.useMemo(() => {
    if (sortState.length === 0) {
      return DATA;
    }
    return DATA.slice().sort((a, b) => {
      for (const {column, order} of sortState) {
        const compare = SORTERS[column];
        const result = compare ? compare(a, b) : 0;
        if (result !== 0) {
          return order === 'asc' ? result : -result;
        }
      }
      return 0;
    });
  }, [sortState]);

  const pageData = React.useMemo(
    () => sortedData.slice((page - 1) * pageSize, page * pageSize),
    [sortedData, page, pageSize],
  );

  const handleSortChange = React.useCallback((next: TableSortState) => {
    setSortState(next);
    setPage(1);
  }, []);

  const handlePaginationUpdate = React.useCallback(
    (nextPage: number, nextPageSize: number) => {
      setPage(nextPageSize === pageSize ? nextPage : 1);
      setPageSize(nextPageSize);
    },
    [pageSize],
  );

  return (
    <Flex direction="column" gap={4} style={{padding: 24, maxWidth: 1100}}>
      <Text variant="header-1">Сотрудники</Text>

      <Text variant="body-1" color="secondary">
        Выбрано: {selectedIds.length} из {DATA.length}
      </Text>

      <div style={{overflowX: 'auto', maxWidth: '100%'}}>
        <SelectableSortableTable
          data={pageData}
          columns={columns}
          getRowDescriptor={getRowDescriptor}
          sortState={sortState}
          onSortStateChange={handleSortChange}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Нет данных"
        />
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={DATA.length}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onUpdate={handlePaginationUpdate}
      />
    </Flex>
  );
}
