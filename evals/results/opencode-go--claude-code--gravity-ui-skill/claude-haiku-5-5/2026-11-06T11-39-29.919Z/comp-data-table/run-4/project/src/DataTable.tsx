import * as React from 'react';
import {
    Button,
    Flex,
    Pagination,
    Table,
    Text,
    withTableSelection,
    withTableSorting,
} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableDataItem, TableSortState} from '@gravity-ui/uikit';

export type DataTableRow = TableDataItem & {id: string};

export type DataTableColumn<T> = {
    id: string;
    name: string;
    align?: 'start' | 'end';
    width?: number | string;
    /** Значение для сортировки. Если не задано — колонка не сортируется. */
    sortValue?: (item: T) => string | number;
    render: (item: T) => React.ReactNode;
};

export type DataTableProps<T extends DataTableRow> = {
    data: T[];
    columns: DataTableColumn<T>[];
    pageSizeOptions?: number[];
    defaultPageSize?: number;
};

type Comparator<T> = (a: T, b: T) => number;

function createComparator<T>(getValue: (item: T) => string | number): Comparator<T> {
    return (a, b) => {
        const va = getValue(a);
        const vb = getValue(b);
        if (typeof va === 'number' && typeof vb === 'number') {
            return va - vb;
        }
        return String(va).localeCompare(String(vb), 'ru');
    };
}

// Table is wrapped with selection and sorting HOCs. Sorting is controlled (sortState + onSortStateChange),
// so the HOC only renders sort indicators; the data is sorted here before pagination.
const EnhancedTable = withTableSorting(withTableSelection(Table));

export function DataTable<T extends DataTableRow>({
    data,
    columns,
    pageSizeOptions = [5, 10, 20],
    defaultPageSize = 10,
}: DataTableProps<T>) {
    const [sortState, setSortState] = React.useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);

    const comparators = React.useMemo(() => {
        const map = new Map<string, Comparator<T>>();
        for (const column of columns) {
            if (column.sortValue) {
                map.set(column.id, createComparator(column.sortValue));
            }
        }
        return map;
    }, [columns]);

    // The HOC-wrapped Table is typed with TableDataItem rows, so columns are erased to that type here.
    // Rows passed in are always T, so the cast back is safe.
    const tableColumns = React.useMemo<TableColumnConfig<TableDataItem>[]>(
        () =>
            columns.map((column) => ({
                id: column.id,
                name: column.name,
                align: column.align,
                width: column.width,
                template: (item: TableDataItem) => column.render(item as T),
                meta: comparators.has(column.id) ? {sort: comparators.get(column.id)} : undefined,
            })),
        [columns, comparators],
    );

    const sortedData = React.useMemo(() => {
        const activeSort = sortState.filter((s) => comparators.has(s.column));
        if (activeSort.length === 0) {
            return data;
        }
        return data.slice().sort((a, b) => {
            for (const {column, order} of activeSort) {
                const result = comparators.get(column)!(a, b);
                if (result !== 0) {
                    return order === 'asc' ? result : -result;
                }
            }
            return 0;
        });
    }, [data, sortState, comparators]);

    const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageItems = React.useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize],
    );

    return (
        <Flex direction="column" gap={4}>
            <Flex alignItems="center" justifyContent="space-between" gap={4}>
                <Text variant="body-1">Выбрано строк: {selectedIds.length}</Text>
                <Button
                    view="flat"
                    disabled={selectedIds.length === 0}
                    onClick={() => setSelectedIds([])}
                >
                    Снять выделение
                </Button>
            </Flex>

            <div style={{overflowX: 'auto', maxWidth: '100%'}}>
                <EnhancedTable
                    data={pageItems}
                    columns={tableColumns}
                    width="max"
                    emptyMessage="Нет данных"
                    getRowDescriptor={(item) => ({id: item.id})}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    sortState={sortState}
                    onSortStateChange={setSortState}
                    disableDataSorting
                />
            </div>

            <Flex justifyContent="flex-end">
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    pageSizeOptions={pageSizeOptions}
                    onUpdate={(nextPage, nextPageSize) => {
                        setPage(nextPage);
                        setPageSize(nextPageSize);
                    }}
                />
            </Flex>
        </Flex>
    );
}
