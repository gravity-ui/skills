import { useCallback, useMemo, useState } from 'react';
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

import { STATUS_LABELS, type Employee, type EmployeeStatus } from './data';

// HOC composition: selection column outside, sorting inside — the standard uikit order.
const EmployeeTable = withTableSelection(withTableSorting<Employee>(Table));

const STATUS_THEME: Record<EmployeeStatus, 'success' | 'info' | 'warning' | 'danger'> = {
  active: 'success',
  vacation: 'info',
  probation: 'warning',
  fired: 'danger',
};

const salaryFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU');

const compareStrings = (key: keyof Employee) => (a: Employee, b: Employee) =>
  String(a[key]).localeCompare(String(b[key]), 'ru');

const compareNumbers = (key: keyof Employee) => (a: Employee, b: Employee) =>
  Number(a[key]) - Number(b[key]);

const columns: TableColumnConfig<Employee>[] = [
  {
    id: 'name',
    name: 'Сотрудник',
    primary: true,
    meta: { sort: compareStrings('name') },
  },
  {
    id: 'department',
    name: 'Отдел',
    meta: { sort: compareStrings('department') },
  },
  {
    id: 'position',
    name: 'Должность',
    meta: { sort: compareStrings('position') },
  },
  {
    id: 'status',
    name: 'Статус',
    template: (item) => (
      <Label theme={STATUS_THEME[item.status]} size="s">
        {STATUS_LABELS[item.status]}
      </Label>
    ),
    meta: {
      sort: (a: Employee, b: Employee) =>
        STATUS_LABELS[a.status].localeCompare(STATUS_LABELS[b.status], 'ru'),
    },
  },
  {
    id: 'salary',
    name: 'Зарплата',
    align: 'end',
    template: (item) => salaryFormatter.format(item.salary),
    meta: { sort: compareNumbers('salary'), defaultSortOrder: 'desc' },
  },
  {
    id: 'hiredAt',
    name: 'Дата найма',
    template: (item) => dateFormatter.format(new Date(item.hiredAt)),
    meta: { sort: compareStrings('hiredAt') },
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface DataTableProps {
  data: Employee[];
}

export function DataTable({ data }: DataTableProps) {
  const [sortState, setSortState] = useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // With a controlled sortState the HOC does not sort data itself, so sort the whole
  // dataset here (same multi-column semantics as the HOC) and only then cut a page out of it.
  const sortedData = useMemo(() => {
    if (sortState.length === 0) {
      return data;
    }
    return data.slice().sort((a, b) => {
      for (const { column: columnId, order } of sortState) {
        const column = columns.find((c) => c.id === columnId);
        const compare = column?.meta?.sort;
        if (typeof compare !== 'function') {
          continue;
        }
        const result = compare(a, b);
        if (result !== 0) {
          return order === 'asc' ? result : -result;
        }
      }
      return 0;
    });
  }, [data, sortState]);

  const total = sortedData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);

  const pageData = useMemo(
    () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedData, currentPage, pageSize],
  );

  const handleSortChange = useCallback((next: TableSortState) => {
    setSortState(next);
    setPage(1);
  }, []);

  const handlePaginationUpdate = useCallback((nextPage: number, nextPageSize: number) => {
    setPage(nextPageSize === pageSize ? nextPage : 1);
    setPageSize(nextPageSize);
  }, [pageSize]);

  const getRowDescriptor = useCallback(
    (item: Employee) => ({ id: item.id, disabled: item.status === 'fired' }),
    [],
  );

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  return (
    <Flex direction="column" gap={4}>
      <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
        <Text variant="body-2" color="secondary">
          Показано {rangeStart}–{rangeEnd} из {total}
        </Text>
        <Flex alignItems="center" gap={2}>
          <Label theme={selectedIds.length > 0 ? 'info' : 'normal'} size="m">
            Выбрано: {selectedIds.length}
          </Label>
          <Button
            view="flat-secondary"
            size="m"
            disabled={selectedIds.length === 0}
            onClick={() => setSelectedIds([])}
          >
            Снять выделение
          </Button>
        </Flex>
      </Flex>

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <EmployeeTable
          data={pageData}
          columns={columns}
          getRowDescriptor={getRowDescriptor}
          sortState={sortState}
          onSortStateChange={handleSortChange}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Нет данных"
          width="max"
        />
      </div>

      <Flex justifyContent="flex-end">
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          total={total}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
          showInput
        />
      </Flex>
    </Flex>
  );
}
