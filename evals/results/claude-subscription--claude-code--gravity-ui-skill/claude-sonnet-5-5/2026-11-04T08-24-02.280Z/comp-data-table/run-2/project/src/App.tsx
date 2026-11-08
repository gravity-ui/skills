import React from 'react';
import {
  Box,
  Flex,
  Pagination,
  Table,
  Text,
  withTableSelection,
  withTableSorting,
} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';

type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: number;
  hiredAt: string; // ISO date
};

const NAMES = [
  'Анна Смирнова',
  'Борис Иванов',
  'Виктория Кузнецова',
  'Глеб Попов',
  'Дарья Соколова',
  'Егор Лебедев',
  'Жанна Козлова',
  'Зиновий Новиков',
  'Ирина Морозова',
  'Кирилл Петров',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Аналитика', 'Поддержка', 'Маркетинг'];
const POSITIONS = ['Junior', 'Middle', 'Senior', 'Lead'];

const DATA: Employee[] = Array.from({length: 87}, (_, i) => ({
  id: String(i + 1),
  name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  department: DEPARTMENTS[(i * 7) % DEPARTMENTS.length],
  position: POSITIONS[(i * 3) % POSITIONS.length],
  salary: 60000 + ((i * 7919) % 140) * 1000,
  hiredAt: new Date(Date.UTC(2015 + (i % 10), (i * 5) % 12, 1 + ((i * 3) % 28)))
    .toISOString()
    .slice(0, 10),
}));

const dateFormatter = new Intl.DateTimeFormat('ru-RU');
const salaryFormatter = new Intl.NumberFormat('ru-RU');

// `meta.sort: true` делает заголовок колонки кликабельным.
// Сами данные сортируем вручную по всему набору — см. sortData ниже.
const columns: TableColumnConfig<Employee>[] = [
  {id: 'name', name: 'Имя', primary: true, meta: {sort: true}},
  {id: 'department', name: 'Отдел', meta: {sort: true}},
  {id: 'position', name: 'Уровень', meta: {sort: true}},
  {
    id: 'salary',
    name: 'Зарплата, ₽',
    align: 'end',
    meta: {sort: true, defaultSortOrder: 'desc'},
    template: (item) => salaryFormatter.format(item.salary),
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    meta: {sort: true, defaultSortOrder: 'desc'},
    template: (item) => dateFormatter.format(new Date(item.hiredAt)),
  },
];

const collator = new Intl.Collator('ru');

function compareBy(column: keyof Employee, a: Employee, b: Employee): number {
  const left = a[column];
  const right = b[column];
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  // ISO-даты и строки сравниваются как строки (для ISO порядок совпадает с хронологическим)
  return collator.compare(String(left), String(right));
}

function sortData(data: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return data;
  }
  return data.slice().sort((a, b) => {
    for (const {column, order} of sortState) {
      const result = compareBy(column as keyof Employee, a, b);
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

const SelectableSortableTable = withTableSelection(withTableSorting(Table<Employee>));

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export function App() {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const sorted = React.useMemo(() => sortData(DATA, sortState), [sortState]);
  const pageData = React.useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(pageSize === nextPageSize ? nextPage : 1);
    setPageSize(nextPageSize);
  };

  const handleSortChange = (nextSortState: TableSortState) => {
    setSortState(nextSortState);
    setPage(1);
  };

  return (
    <Box spacing={{p: 6}}>
      <Flex direction="column" gap={4}>
        <Flex justifyContent="space-between" alignItems="baseline" gap={4} wrap>
          <Text variant="header-1">Сотрудники</Text>
          <Text variant="body-1" color="secondary">
            Выбрано: {selectedIds.length} из {DATA.length}
          </Text>
        </Flex>

        <div style={{overflowX: 'auto', maxWidth: '100%'}}>
          <SelectableSortableTable
            data={pageData}
            columns={columns}
            getRowId="id"
            sortState={sortState}
            onSortStateChange={handleSortChange}
            disableDataSorting
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="Нет данных"
          />
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
        />
      </Flex>
    </Box>
  );
}
