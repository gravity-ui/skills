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
    WithTableSelectionProps,
} from '@gravity-ui/uikit';

import type {Employee, EmployeeStatus} from './data';

// Sorting HOC outside, selection inside: the header checkbox column is not sortable.
const EmployeesTable = withTableSorting<Employee, WithTableSelectionProps<Employee>>(
    withTableSelection<Employee>(Table),
);

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_META: Record<EmployeeStatus, {title: string; theme: LabelProps['theme']; order: number}> = {
    active: {title: 'Работает', theme: 'success', order: 0},
    vacation: {title: 'В отпуске', theme: 'warning', order: 1},
    fired: {title: 'Уволен', theme: 'danger', order: 2},
};

const salaryFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU');

type Comparator = (a: Employee, b: Employee) => number;

const COMPARATORS: Record<string, Comparator> = {
    name: (a, b) => a.name.localeCompare(b.name, 'ru'),
    department: (a, b) => a.department.localeCompare(b.department, 'ru'),
    salary: (a, b) => a.salary - b.salary,
    hireDate: (a, b) => a.hireDate.localeCompare(b.hireDate),
    status: (a, b) => STATUS_META[a.status].order - STATUS_META[b.status].order,
};

const COLUMNS: TableColumnConfig<Employee>[] = [
    {id: 'name', name: 'Сотрудник', primary: true, meta: {sort: COMPARATORS.name}},
    {id: 'department', name: 'Отдел', meta: {sort: COMPARATORS.department}},
    {id: 'position', name: 'Должность'},
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        template: (item) => salaryFormatter.format(item.salary),
        meta: {sort: COMPARATORS.salary, defaultSortOrder: 'desc'},
    },
    {
        id: 'hireDate',
        name: 'Дата найма',
        template: (item) => dateFormatter.format(new Date(item.hireDate)),
        meta: {sort: COMPARATORS.hireDate},
    },
    {
        id: 'status',
        name: 'Статус',
        template: (item) => {
            const {title, theme} = STATUS_META[item.status];
            return <Label theme={theme}>{title}</Label>;
        },
        meta: {sort: COMPARATORS.status},
    },
];

/** Sorts the whole dataset (not just the visible page), supports multi-column sort via Shift+click. */
function sortItems(items: Employee[], sortState: TableSortState): Employee[] {
    if (sortState.length === 0) {
        return items;
    }
    return items.slice().sort((a, b) => {
        for (const {column, order} of sortState) {
            const compare = COMPARATORS[column];
            const result = compare ? compare(a, b) : 0;
            if (result !== 0) {
                return order === 'asc' ? result : -result;
            }
        }
        return 0;
    });
}

const getRowDescriptor = (item: Employee) => ({id: item.id});

export interface DataTableProps {
    data: Employee[];
}

export function DataTable({data}: DataTableProps) {
    const [sortState, setSortState] = React.useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[0]);

    const sortedData = React.useMemo(() => sortItems(data, sortState), [data, sortState]);

    const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageData = React.useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize],
    );

    const handleSortStateChange = React.useCallback((nextSortState: TableSortState) => {
        setSortState(nextSortState);
        setPage(1);
    }, []);

    const handlePaginationUpdate = React.useCallback<PaginationProps['onUpdate']>(
        (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
        },
        [],
    );

    const handleClearSelection = React.useCallback(() => setSelectedIds([]), []);

    return (
        <Flex direction="column" gap={4}>
            <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                <Text variant="header-1">Сотрудники</Text>
                <Flex alignItems="center" gap={3} style={{flexShrink: 0}}>
                    <Text color="secondary">
                        {selectedIds.length > 0
                            ? `Выбрано: ${selectedIds.length} из ${data.length}`
                            : `Всего: ${data.length}`}
                    </Text>
                    <Button
                        view="flat-secondary"
                        disabled={selectedIds.length === 0}
                        onClick={handleClearSelection}
                    >
                        Снять выделение
                    </Button>
                </Flex>
            </Flex>

            <EmployeesTable
                data={pageData}
                columns={COLUMNS}
                width="max"
                getRowDescriptor={getRowDescriptor}
                emptyMessage="Нет данных"
                sortState={sortState}
                onSortStateChange={handleSortStateChange}
                // Data is sorted above, before pagination — otherwise only the current page would be sorted.
                disableDataSorting
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />

            {data.length > 0 && (
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
