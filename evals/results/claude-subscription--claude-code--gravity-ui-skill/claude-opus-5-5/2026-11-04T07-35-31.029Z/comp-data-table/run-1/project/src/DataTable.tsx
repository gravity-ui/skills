import * as React from 'react';
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
import type {
    LabelProps,
    PaginationProps,
    TableColumnConfig,
    TableSortState,
    WithTableSortingProps,
} from '@gravity-ui/uikit';

import type {Employee, EmployeeStatus} from './employees';

// Order matters: selection wraps sorting, so the checkbox column is not sortable.
const EnhancedTable = withTableSelection<Employee, WithTableSortingProps>(
    withTableSorting<Employee>(Table),
);

type SortFn = (a: Employee, b: Employee) => number;

const STATUS_VIEW: Record<EmployeeStatus, {text: string; theme: LabelProps['theme']}> = {
    active: {text: 'Работает', theme: 'success'},
    vacation: {text: 'В отпуске', theme: 'info'},
    dismissed: {text: 'Уволен', theme: 'unknown'},
};

const collator = new Intl.Collator('ru');
const salaryFormat = new Intl.NumberFormat('ru-RU', {style: 'currency', currency: 'RUB', maximumFractionDigits: 0});
const dateFormat = new Intl.DateTimeFormat('ru-RU');

const byString =
    (key: 'name' | 'department' | 'position' | 'status'): SortFn =>
    (a, b) =>
        collator.compare(a[key], b[key]);

const columns: TableColumnConfig<Employee>[] = [
    {id: 'name', name: 'Сотрудник', primary: true, meta: {sort: byString('name')}},
    {id: 'department', name: 'Отдел', meta: {sort: byString('department')}},
    {id: 'position', name: 'Должность', meta: {sort: byString('position')}},
    {
        id: 'salary',
        name: 'Оклад',
        align: 'end',
        template: (item) => salaryFormat.format(item.salary),
        meta: {sort: ((a, b) => a.salary - b.salary) satisfies SortFn, defaultSortOrder: 'desc'},
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        align: 'end',
        template: (item) => dateFormat.format(new Date(item.hiredAt)),
        // ISO dates compare correctly as strings.
        meta: {sort: ((a, b) => a.hiredAt.localeCompare(b.hiredAt)) satisfies SortFn},
    },
    {
        id: 'status',
        name: 'Статус',
        template: (item) => (
            <Label theme={STATUS_VIEW[item.status].theme}>{STATUS_VIEW[item.status].text}</Label>
        ),
        meta: {sort: byString('status')},
    },
];

/**
 * withTableSorting only sorts the rows it receives. With pagination that would be the
 * current page only, so sorting is controlled here and applied to the full data set
 * (the HOC gets `disableDataSorting` and only renders headers/indicators).
 * Supports multi-column sort (Shift+click on a header).
 */
function sortData(data: Employee[], sortState: TableSortState): Employee[] {
    if (sortState.length === 0) {
        return data;
    }

    return data.slice().sort((a, b) => {
        for (const {column, order} of sortState) {
            const compare = columns.find((c) => c.id === column)?.meta?.sort as SortFn | undefined;
            const result = compare?.(a, b) ?? 0;
            if (result !== 0) {
                return order === 'asc' ? result : -result;
            }
        }
        return 0;
    });
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export interface DataTableProps {
    data: Employee[];
}

export function DataTable({data}: DataTableProps) {
    const [sortState, setSortState] = React.useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);

    const sortedData = React.useMemo(() => sortData(data, sortState), [data, sortState]);

    // Keep the page in range if data shrinks or page size grows.
    const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSortStateChange = (nextSortState: TableSortState) => {
        setSortState(nextSortState);
        setPage(1);
    };

    const handlePaginationUpdate: PaginationProps['onUpdate'] = (nextPage, nextPageSize) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    };

    const getRowDescriptor = React.useCallback((item: Employee) => ({id: item.id}), []);

    return (
        <Flex direction="column" gap={4}>
            <Flex alignItems="center" justifyContent="space-between" gap={3} wrap style={{minHeight: 28}}>
                <Text color="secondary">
                    {selectedIds.length > 0
                        ? `Выбрано: ${selectedIds.length} из ${data.length}`
                        : `Всего записей: ${data.length}`}
                </Text>
                {selectedIds.length > 0 && (
                    <Button view="flat-secondary" size="m" onClick={() => setSelectedIds([])}>
                        Снять выделение
                    </Button>
                )}
            </Flex>

            {/* Horizontal scroll stays inside the table container, not the page. */}
            <div style={{overflowX: 'auto', maxWidth: '100%'}}>
                <EnhancedTable
                    data={pageData}
                    columns={columns}
                    getRowDescriptor={getRowDescriptor}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    sortState={sortState}
                    onSortStateChange={handleSortStateChange}
                    disableDataSorting
                    width="max"
                    emptyMessage="Нет данных"
                />
            </div>

            {sortedData.length > 0 && (
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    onUpdate={handlePaginationUpdate}
                />
            )}
        </Flex>
    );
}
