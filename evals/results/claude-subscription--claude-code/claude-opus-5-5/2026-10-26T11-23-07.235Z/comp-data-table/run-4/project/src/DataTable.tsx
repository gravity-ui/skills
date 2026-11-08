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
import type {
    TableColumnConfig,
    TableDataItem,
    TableSortState,
    WithTableSortingProps,
} from '@gravity-ui/uikit';

// Сортировку и выделение рисуют штатные HOC'и Gravity UI. Сортировка у HOC'а
// контролируемая (sortState + onSortStateChange), поэтому сам он данные не
// сортирует — мы сортируем весь набор и только потом режем на страницы.
const EnhancedTable = withTableSelection<TableDataItem, WithTableSortingProps>(
    withTableSorting<TableDataItem>(Table),
);

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

export type CompareFn<T> = (a: T, b: T) => number;

export interface DataTableColumn<T> extends TableColumnConfig<T> {
    /** Ключ значения для сортировки. По умолчанию — `id` колонки. */
    sortKey?: keyof T;
    /** `true` — сортировать по значению, функция — собственный компаратор (по возрастанию). */
    sortable?: boolean | CompareFn<T>;
    /** Порядок при первом клике по заголовку. */
    defaultSortOrder?: 'asc' | 'desc';
}

export interface DataTableProps<T extends TableDataItem> {
    data: T[];
    columns: DataTableColumn<T>[];
    getRowId: (item: T) => string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    defaultSortState?: TableSortState;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    emptyMessage?: string;
}

function compareValues(a: unknown, b: unknown): number {
    if (a === b) return 0;
    if (a === null || a === undefined) return 1;
    if (b === null || b === undefined) return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return collator.compare(String(a), String(b));
}

function getComparator<T>(column: DataTableColumn<T>): CompareFn<T> | undefined {
    if (typeof column.sortable === 'function') return column.sortable;
    if (!column.sortable) return undefined;
    const key = (column.sortKey ?? column.id) as keyof T;
    return (a, b) => compareValues(a[key], b[key]);
}

function sortData<T>(data: T[], columns: DataTableColumn<T>[], sortState: TableSortState): T[] {
    const comparators = sortState
        .map(({ column, order }) => {
            const config = columns.find((c) => c.id === column);
            const compare = config && getComparator(config);
            return compare && { compare, sign: order === 'asc' ? 1 : -1 };
        })
        .filter((c): c is { compare: CompareFn<T>; sign: number } => Boolean(c));

    if (comparators.length === 0) return data;

    // Array#sort стабилен, поэтому при равенстве сохраняется исходный порядок.
    return data.slice().sort((a, b) => {
        for (const { compare, sign } of comparators) {
            const result = compare(a, b);
            if (result !== 0) return result * sign;
        }
        return 0;
    });
}

export function DataTable<T extends TableDataItem>({
    data,
    columns,
    getRowId,
    selectedIds,
    onSelectionChange,
    defaultSortState = [],
    pageSizeOptions = [10, 20, 50],
    defaultPageSize = pageSizeOptions[0],
    emptyMessage = 'Нет данных',
}: DataTableProps<T>) {
    const [sortState, setSortState] = React.useState<TableSortState>(defaultSortState);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);

    const tableColumns = React.useMemo(
        () =>
            columns.map(({ sortable, sortKey, defaultSortOrder, ...column }) =>
                sortable
                    ? { ...column, meta: { ...column.meta, sort: true, defaultSortOrder } }
                    : column,
            ) as TableColumnConfig<TableDataItem>[],
        [columns],
    );

    const sortedData = React.useMemo(
        () => sortData(data, columns, sortState),
        [data, columns, sortState],
    );

    const total = sortedData.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    // Если строк стало меньше (например, часть удалили), не остаёмся на пустой странице.
    const currentPage = Math.min(page, pageCount);
    const pageStart = (currentPage - 1) * pageSize;
    const pageData = React.useMemo(
        () => sortedData.slice(pageStart, pageStart + pageSize),
        [sortedData, pageStart, pageSize],
    );

    const handleSortStateChange = (next: TableSortState) => {
        setSortState(next);
        setPage(1);
    };

    const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    };

    const selectedCount = selectedIds.length;
    const allSelected = total > 0 && selectedCount === total;

    return (
        <Flex direction="column" gap={3}>
            <Flex alignItems="center" gap={3} style={{ minHeight: 28 }}>
                {selectedCount > 0 ? (
                    <>
                        <Text variant="subheader-1">
                            Выбрано: {selectedCount} из {total}
                        </Text>
                        {!allSelected && (
                            <Button
                                view="flat-action"
                                size="s"
                                onClick={() => onSelectionChange(sortedData.map(getRowId))}
                            >
                                Выбрать все {total}
                            </Button>
                        )}
                        <Button view="flat-secondary" size="s" onClick={() => onSelectionChange([])}>
                            Снять выделение
                        </Button>
                    </>
                ) : (
                    <Text color="secondary">Всего записей: {total}</Text>
                )}
            </Flex>

            <EnhancedTable
                data={pageData}
                columns={tableColumns}
                getRowDescriptor={(item) => ({ id: getRowId(item as T) })}
                sortState={sortState}
                onSortStateChange={handleSortStateChange}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                emptyMessage={emptyMessage}
                width="max"
            />

            {total > 0 && (
                <Flex alignItems="center" justifyContent="space-between" gap={3} wrap>
                    <Text color="secondary">
                        {pageStart + 1}–{pageStart + pageData.length} из {total}
                    </Text>
                    <Pagination
                        page={currentPage}
                        pageSize={pageSize}
                        total={total}
                        pageSizeOptions={pageSizeOptions}
                        onUpdate={handlePaginationUpdate}
                    />
                </Flex>
            )}
        </Flex>
    );
}
