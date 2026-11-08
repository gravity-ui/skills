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
import type {LabelProps, TableColumnConfig, TableSortState} from '@gravity-ui/uikit';

import type {Employee, Status} from './data';

const SortableSelectableTable = withTableSelection(withTableSorting(Table<Employee>));

const STATUS_LABELS: Record<Status, {text: string; theme: LabelProps['theme']}> = {
  active: {text: 'Активен', theme: 'success'},
  pending: {text: 'Ожидает', theme: 'warning'},
  blocked: {text: 'Заблокирован', theme: 'danger'},
};

const salaryFormat = new Intl.NumberFormat('ru-RU');
const dateFormat = new Intl.DateTimeFormat('ru-RU');

const collator = new Intl.Collator('ru');
const compare: Record<string, (a: Employee, b: Employee) => number> = {
  id: (a, b) => Number(a.id) - Number(b.id),
  name: (a, b) => collator.compare(a.name, b.name),
  email: (a, b) => collator.compare(a.email, b.email),
  department: (a, b) => collator.compare(a.department, b.department),
  status: (a, b) => collator.compare(STATUS_LABELS[a.status].text, STATUS_LABELS[b.status].text),
  salary: (a, b) => a.salary - b.salary,
  hiredAt: (a, b) => a.hiredAt.localeCompare(b.hiredAt),
};

// `meta.sort` marks a column as sortable (the HOC renders the header indicator).
// Actual sorting is done below on the whole dataset, so it works across pages.
const sortable = {sort: true};

const columns: TableColumnConfig<Employee>[] = [
  {id: 'id', name: 'ID', width: 70, meta: sortable},
  {id: 'name', name: 'Имя', primary: true, meta: sortable},
  {id: 'email', name: 'Email', meta: sortable},
  {id: 'department', name: 'Отдел', meta: sortable},
  {
    id: 'status',
    name: 'Статус',
    meta: sortable,
    template: (item) => (
      <Label theme={STATUS_LABELS[item.status].theme}>{STATUS_LABELS[item.status].text}</Label>
    ),
  },
  {
    id: 'salary',
    name: 'Зарплата, ₽',
    align: 'end',
    meta: sortable,
    template: (item) => salaryFormat.format(item.salary),
  },
  {
    id: 'hiredAt',
    name: 'Принят',
    meta: sortable,
    template: (item) => dateFormat.format(new Date(item.hiredAt)),
  },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export interface DataTableProps {
  data: Employee[];
}

export function DataTable({data}: DataTableProps) {
  const [sortState, setSortState] = React.useState<TableSortState>([]);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  // Selection is stored by row id, so it survives sorting and page changes.
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const sorted = React.useMemo(() => {
    const [current] = sortState;
    if (!current) return data;
    const cmp = compare[current.column];
    if (!cmp) return data;
    const direction = current.order === 'desc' ? -1 : 1;
    return [...data].sort((a, b) => direction * cmp(a, b));
  }, [data, sortState]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageData = React.useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize],
  );

  const handleSortChange = (next: TableSortState) => {
    // Single-column sorting: keep only the most recently clicked column.
    setSortState(next.slice(-1));
    setPage(1);
  };

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setPage(1);
    } else {
      setPage(nextPage);
    }
  };

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" gap={3} style={{minHeight: 36}}>
        <Text variant="body-2" color="secondary">
          Выбрано: {selectedIds.length} из {data.length}
        </Text>
        <Button
          view="outlined"
          size="m"
          disabled={allSelected}
          onClick={() => setSelectedIds(data.map((item) => item.id))}
        >
          Выбрать все ({data.length})
        </Button>
        <Button
          view="flat"
          size="m"
          disabled={selectedIds.length === 0}
          onClick={() => setSelectedIds([])}
        >
          Снять выделение
        </Button>
      </Flex>

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
        page={currentPage}
        pageSize={pageSize}
        total={sorted.length}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onUpdate={handlePaginationUpdate}
      />
    </Flex>
  );
}
