import * as React from 'react';
import {
    Button,
    Pagination,
    Table,
    Text,
    withTableSelection,
    withTableSorting,
} from '@gravity-ui/uikit';
import type {
    DescriptorType,
    TableColumnConfig,
    TableDataItem,
    TableSortState,
    WithTableSortingProps,
} from '@gravity-ui/uikit';

import { clampPage, compareValues, paginate, sortData } from './dataTableUtils';
import type { CompareFn } from './dataTableUtils';
import './DataTable.css';

const EnhancedTable = withTableSelection<TableDataItem, WithTableSortingProps>(
    withTableSorting<TableDataItem>(Table),
);

export interface DataTableColumn<I> extends Omit<TableColumnConfig<I>, 'meta'> {
    /**
     * `true` — сортировка по значению поля `item[id]`;
     * функция — собственный компаратор (для вычисляемых колонок).
     */
    sortable?: boolean | CompareFn<I>;
    /** Порядок при первом клике по заголовку. По умолчанию `asc`. */
    defaultSortOrder?: 'asc' | 'desc';
}

export interface DataTableProps<I extends TableDataItem> {
    data: I[];
    columns: DataTableColumn<I>[];
    getRowId: (item: I) => string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    isRowSelectionDisabled?: (item: I) => boolean;
    defaultSortState?: TableSortState;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
    emptyMessage?: string;
    /** Дополнительные действия над выделенными строками (кнопки в панели выделения). */
    selectionActions?: React.ReactNode;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function DataTable<I extends TableDataItem>({
    data,
    columns,
    getRowId,
    selectedIds,
    onSelectionChange,
    isRowSelectionDisabled,
    defaultSortState = [],
    defaultPageSize = DEFAULT_PAGE_SIZE_OPTIONS[0],
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    emptyMessage = 'Нет данных',
    selectionActions,
}: DataTableProps<I>) {
    const [sortState, setSortState] = React.useState<TableSortState>(defaultSortState);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);

    const comparators = React.useMemo(() => {
        const result: Record<string, CompareFn<I> | undefined> = {};
        for (const column of columns) {
            if (typeof column.sortable === 'function') {
                result[column.id] = column.sortable;
            } else if (column.sortable) {
                result[column.id] = (a, b) => compareValues(a[column.id], b[column.id]);
            }
        }
        return result;
    }, [columns]);

    // HOC-и мемоизируют колонки по ссылке, поэтому массив должен быть стабильным.
    const tableColumns = React.useMemo(
        () =>
            columns.map(({ sortable, defaultSortOrder, ...column }) => ({
                ...column,
                meta: sortable ? { sort: true, defaultSortOrder } : undefined,
            })) as TableColumnConfig<TableDataItem>[],
        [columns],
    );

    const sortedData = React.useMemo(
        () => sortData(data, sortState, comparators),
        [data, sortState, comparators],
    );

    // Если данных стало меньше (например, строки удалили), не остаёмся на несуществующей странице.
    const currentPage = clampPage(page, sortedData.length, pageSize);
    const pageData = React.useMemo(
        () => paginate(sortedData, currentPage, pageSize),
        [sortedData, currentPage, pageSize],
    );

    const getRowDescriptor = React.useCallback(
        (item: TableDataItem): DescriptorType => ({ id: getRowId(item as I) }),
        [getRowId],
    );

    const handleRowSelectionDisabled = React.useMemo(
        () => (isRowSelectionDisabled ? (item: TableDataItem) => isRowSelectionDisabled(item as I) : undefined),
        [isRowSelectionDisabled],
    );

    const handleSortStateChange = React.useCallback((nextSortState: TableSortState) => {
        setSortState(nextSortState);
        setPage(1);
    }, []);

    const handlePaginationUpdate = React.useCallback((nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    }, []);

    const selectableIds = React.useMemo(
        () =>
            data
                .filter((item) => !isRowSelectionDisabled?.(item))
                .map((item) => getRowId(item)),
        [data, getRowId, isRowSelectionDisabled],
    );
    const allSelected =
        selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

    const rangeStart = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const rangeEnd = Math.min(currentPage * pageSize, sortedData.length);

    return (
        <div className="data-table">
            <div className="data-table__toolbar">
                {selectedIds.length > 0 ? (
                    <>
                        <Text variant="subheader-1">Выбрано: {selectedIds.length}</Text>
                        {!allSelected && (
                            <Button view="flat-action" onClick={() => onSelectionChange(selectableIds)}>
                                Выбрать все ({selectableIds.length})
                            </Button>
                        )}
                        <Button view="flat" onClick={() => onSelectionChange([])}>
                            Снять выделение
                        </Button>
                        {selectionActions && (
                            <div className="data-table__actions">{selectionActions}</div>
                        )}
                    </>
                ) : (
                    <Text color="secondary">
                        Отметьте строки чекбоксами. Shift + клик — выделить диапазон, Shift + клик
                        по заголовку — сортировка по нескольким колонкам.
                    </Text>
                )}
            </div>

            <div className="data-table__table">
                <EnhancedTable
                    width="max"
                    data={pageData}
                    columns={tableColumns}
                    getRowDescriptor={getRowDescriptor}
                    selectedIds={selectedIds}
                    onSelectionChange={onSelectionChange}
                    isRowSelectionDisabled={handleRowSelectionDisabled}
                    sortState={sortState}
                    onSortStateChange={handleSortStateChange}
                    disableDataSorting
                    emptyMessage={emptyMessage}
                />
            </div>

            <div className="data-table__footer">
                <Text color="secondary">
                    {rangeStart}–{rangeEnd} из {sortedData.length}
                </Text>
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    pageSizeOptions={pageSizeOptions}
                    onUpdate={handlePaginationUpdate}
                />
            </div>
        </div>
    );
}
