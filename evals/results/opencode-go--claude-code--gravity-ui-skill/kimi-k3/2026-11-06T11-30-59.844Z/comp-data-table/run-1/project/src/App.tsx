import React from 'react';

import {
    Box,
    Card,
    Flex,
    Pagination,
    Table,
    Text,
    withTableSelection,
    withTableSorting,
} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';

import type {Employee} from './data';
import {employees} from './data';

const DataTable = withTableSelection(withTableSorting<Employee>(Table));

const compareStrings = (getValue: (item: Employee) => string) => (a: Employee, b: Employee) =>
    getValue(a).localeCompare(getValue(b), 'ru');

const columns: TableColumnConfig<Employee>[] = [
    {
        id: 'name',
        name: 'Имя',
        primary: true,
        meta: {sort: compareStrings((item) => item.name)},
    },
    {
        id: 'department',
        name: 'Отдел',
        meta: {sort: compareStrings((item) => item.department)},
    },
    {
        id: 'position',
        name: 'Должность',
        meta: {sort: compareStrings((item) => item.position)},
    },
    {
        id: 'salary',
        name: 'Зарплата',
        align: 'end',
        template: (item) => `${item.salary.toLocaleString('ru-RU')} ₽`,
        meta: {sort: (a: Employee, b: Employee) => a.salary - b.salary},
    },
    {
        id: 'hiredAt',
        name: 'Дата найма',
        template: (item) => new Date(item.hiredAt).toLocaleDateString('ru-RU'),
        meta: {sort: true},
    },
];

function defaultCompare(columnId: string) {
    return (a: Employee, b: Employee) => {
        const valueA = a[columnId as keyof Employee];
        const valueB = b[columnId as keyof Employee];
        if (valueA === valueB) {
            return 0;
        }
        return valueA > valueB ? 1 : -1;
    };
}

function sortEmployees(data: Employee[], sortState: TableSortState): Employee[] {
    if (sortState.length === 0) {
        return data;
    }
    return [...data].sort((a, b) => {
        for (const {column, order} of sortState) {
            const metaSort = columns.find((c) => c.id === column)?.meta?.sort;
            const compare = typeof metaSort === 'function' ? metaSort : defaultCompare(column);
            const result: number = compare(a, b);
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

    // Sorting is applied to the whole dataset; pagination slices the result.
    // The HOC is used in controlled mode (sortState + onSortStateChange), so it
    // only renders the sort indicators while the data is sorted here.
    const sortedData = React.useMemo(() => sortEmployees(employees, sortState), [sortState]);

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSortStateChange = (newSortState: TableSortState) => {
        setSortState(newSortState);
        setPage(1);
    };

    const handlePageUpdate = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setPageSize(newPageSize);
    };

    return (
        <Box spacing={{p: 6}}>
            <Flex direction="column" gap={4}>
                <Flex justifyContent="space-between" alignItems="center" gap={4}>
                    <Text variant="header-1">Сотрудники</Text>
                    <Text variant="body-2" color="secondary" style={{flexShrink: 0}}>
                        Выбрано строк: {selectedIds.length}
                    </Text>
                </Flex>
                <Card>
                    <DataTable
                        data={pageData}
                        columns={columns}
                        width="max"
                        getRowDescriptor={(item) => ({id: item.id})}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        sortState={sortState}
                        onSortStateChange={handleSortStateChange}
                    />
                </Card>
                <Flex justifyContent="flex-end">
                    <Pagination
                        page={currentPage}
                        pageSize={pageSize}
                        total={sortedData.length}
                        pageSizeOptions={[10, 20, 50]}
                        showInput
                        onUpdate={handlePageUpdate}
                    />
                </Flex>
            </Flex>
        </Box>
    );
}
