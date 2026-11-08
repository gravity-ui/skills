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
import type {LabelProps, TableColumnConfig, TableSortState, WithTableSortingProps} from '@gravity-ui/uikit';

import './DataTable.css';

export type EmployeeStatus = 'active' | 'vacation' | 'fired';

export interface Employee {
    id: string;
    name: string;
    department: string;
    position: string;
    salary: number;
    hiredAt: string; // ISO date
    status: EmployeeStatus;
}

// Sorting is controlled and applied to the WHOLE dataset before pagination,
// otherwise only the current page would be sorted.
const EnhancedTable = withTableSelection<Employee, WithTableSortingProps>(withTableSorting<Employee>(Table));

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_META: Record<EmployeeStatus, {text: string; theme: LabelProps['theme']}> = {
    active: {text: 'Работает', theme: 'success'},
    vacation: {text: 'В отпуске', theme: 'warning'},
    fired: {text: 'Уволен', theme: 'danger'},
};

const salaryFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU');
const collator = new Intl.Collator('ru');

type Comparator = (a: Employee, b: Employee) => number;

const columns: TableColumnConfig<Employee>[] = [
    {
        id: 'name',
        name: 'Сотрудник',
        primary: true,
        meta: {sort: ((a, b) => collator.compare(a.name, b.name)) satisfies Comparator},
    },
    {
        id: 'department',
        name: 'Отдел',
        meta: {sort: ((a, b) => collator.compare(a.department, b.department)) satisfies Comparator},
    },
    {id: 'position', name: 'Должность'},
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        template: (item) => salaryFormatter.format(item.salary),
        meta: {
            sort: ((a, b) => a.salary - b.salary) satisfies Comparator,
            defaultSortOrder: 'desc',
        },
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        template: (item) => dateFormatter.format(new Date(item.hiredAt)),
        meta: {sort: ((a, b) => a.hiredAt.localeCompare(b.hiredAt)) satisfies Comparator},
    },
    {
        id: 'status',
        name: 'Статус',
        template: (item) => {
            const {text, theme} = STATUS_META[item.status];
            return (
                <Label theme={theme} size="xs">
                    {text}
                </Label>
            );
        },
        meta: {
            sort: ((a, b) => collator.compare(STATUS_META[a.status].text, STATUS_META[b.status].text)) satisfies Comparator,
        },
    },
];

function sortData(data: Employee[], sortState: TableSortState): Employee[] {
    if (sortState.length === 0) {
        return data;
    }

    return data.slice().sort((a, b) => {
        for (const {column, order} of sortState) {
            const compare = columns.find((c) => c.id === column)?.meta?.sort as Comparator | undefined;
            if (!compare) {
                continue;
            }
            const result = compare(a, b);
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

    const sortedData = React.useMemo(() => sortData(data, sortState), [data, sortState]);

    // Keep the page in range if data shrinks or page size grows.
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

    const handlePaginationUpdate = React.useCallback((nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    }, []);

    const handleClearSelection = React.useCallback(() => setSelectedIds([]), []);

    const selectedCount = selectedIds.length;

    return (
        <Flex direction="column" gap={4} className="data-table">
            <Flex alignItems="center" justifyContent="space-between" gap={3} wrap className="data-table__toolbar">
                <Text variant="header-1">Сотрудники</Text>
                <Flex alignItems="center" gap={3} className="data-table__selection">
                    <Text color="secondary">
                        {selectedCount > 0
                            ? `Выбрано: ${selectedCount} из ${data.length}`
                            : `Всего: ${data.length}`}
                    </Text>
                    {selectedCount > 0 && (
                        <Button view="flat-secondary" size="s" onClick={handleClearSelection}>
                            Снять выделение
                        </Button>
                    )}
                </Flex>
            </Flex>

            <div className="data-table__scroll">
                <EnhancedTable
                    className="data-table__table"
                    width="max"
                    data={pageData}
                    columns={columns}
                    getRowDescriptor={getRowDescriptor}
                    sortState={sortState}
                    onSortStateChange={handleSortStateChange}
                    disableDataSorting
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
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
