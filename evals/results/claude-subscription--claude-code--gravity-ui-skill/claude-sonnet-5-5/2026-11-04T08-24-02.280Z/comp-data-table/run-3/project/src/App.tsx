import React from 'react';
import {
  Flex,
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
  position: string;
  salary: number;
}

const NAMES = [
  'Анна Иванова',
  'Борис Петров',
  'Вера Смирнова',
  'Григорий Козлов',
  'Дарья Новикова',
  'Егор Морозов',
  'Жанна Волкова',
  'Захар Соловьёв',
  'Ирина Лебедева',
  'Кирилл Попов',
];
const DEPARTMENTS = ['Разработка', 'Дизайн', 'Аналитика', 'Маркетинг', 'Поддержка'];
const POSITIONS = ['Junior', 'Middle', 'Senior', 'Lead'];

const DATA: Employee[] = Array.from({length: 57}, (_, i) => ({
  id: String(i + 1),
  name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  department: DEPARTMENTS[(i * 3) % DEPARTMENTS.length],
  position: POSITIONS[(i * 7) % POSITIONS.length],
  salary: 60000 + ((i * 7919) % 90) * 1000,
}));

const salaryFormat = new Intl.NumberFormat('ru-RU');

const columns: TableColumnConfig<Employee>[] = [
  {id: 'id', name: 'ID', width: 80, meta: {sort: true}},
  {id: 'name', name: 'Сотрудник', primary: true, meta: {sort: true}},
  {id: 'department', name: 'Отдел', meta: {sort: true}},
  {id: 'position', name: 'Уровень', meta: {sort: true}},
  {
    id: 'salary',
    name: 'Зарплата, ₽',
    align: 'end',
    template: (item) => salaryFormat.format(item.salary),
    meta: {sort: true},
  },
];

const SortableSelectableTable = withTableSelection(withTableSorting(Table<Employee>));

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function sortData(data: Employee[], sortState: TableSortState): Employee[] {
  if (sortState.length === 0) {
    return data;
  }
  return data.slice().sort((a, b) => {
    for (const {column, order} of sortState) {
      const key = column as keyof Employee;
      const left = a[key];
      const right = b[key];
      let result = 0;
      if (typeof left === 'number' && typeof right === 'number') {
        result = left - right;
      } else {
        // numeric: true — строковые ID ("2" < "10") сортируются как числа
        result = String(left).localeCompare(String(right), 'ru', {numeric: true});
      }
      if (result !== 0) {
        return order === 'asc' ? result : -result;
      }
    }
    return 0;
  });
}

export function App() {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Сортируем весь набор данных, и только потом режем на страницы.
  const sorted = React.useMemo(() => sortData(DATA, sortState), [sortState]);
  const pageData = React.useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const handleSortChange = (next: TableSortState) => {
    setSortState(next);
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setPage(nextPageSize === pageSize ? nextPage : 1);
    setPageSize(nextPageSize);
  };

  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <Text variant="header-1">Сотрудники</Text>
      <Text variant="body-1" color="secondary">
        Выбрано: {selectedIds.length} из {DATA.length}
      </Text>

      <SortableSelectableTable
        data={pageData}
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
