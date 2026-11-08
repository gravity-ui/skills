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
    DescriptorType,
    TableColumnConfig,
    TableDataItem,
    TableSortState,
} from '@gravity-ui/uikit';

import {clampPage, compareValues, paginate, sortRows} from './sortRows';
import type {Comparator} from './sortRows';

// HOC создаются один раз на уровне модуля, иначе таблица будет перемонтироваться на каждый рендер.
const EnhancedTable = withTableSorting(withTableSelection<TableDataItem>(Table));

export interface DataTableColumn<T> extends TableColumnConfig<T> {
    /**
     * `true` — сортировка по значению поля с именем `id`;
     * функция — собственный компаратор (в порядке возрастания).
     */
    sortable?: boolean | Comparator<T>;
}

export interface DataTableProps<T extends object> {
    data: T[];
    /** Для корректной работы держите массив стабильным (константа модуля или useMemo). */
    columns: DataTableColumn<T>[];
    getRowId: (item: T) => string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    defaultSortState?: TableSortState;
    emptyMessage?: string;
    /** Дополнительные действия над выбранными строками. */
    selectionActions?: React.ReactNode;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

export function DataTable<T extends object>({
    data,
    columns,
    getRowId,
    selectedIds,
    onSelectionChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    defaultPageSize = pageSizeOptions[0],
    defaultSortState = [],
    emptyMessage = 'Нет данных',
    selectionActions,
}: DataTableProps<T>) {
    const [sortState, setSortState] = React.useState<TableSortState>(defaultSortState);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(defaultPageSize);

    const comparators = React.useMemo(() => {
        const map = new Map<string, Comparator<T>>();
        for (const {id, sortable} of columns) {
            if (typeof sortable === 'function') {
                map.set(id, sortable);
            } else if (sortable) {
                map.set(id, (a, b) =>
                    compareValues((a as TableDataItem)[id], (b as TableDataItem)[id]),
                );
            }
        }
        return map;
    }, [columns]);

    // Флаг meta.sort нужен Gravity UI только для отрисовки кликабельного заголовка:
    // сами данные сортируем мы — по всему набору, а не в пределах страницы.
    const tableColumns = React.useMemo(
        () =>
            columns.map(({sortable, ...column}) => ({
                ...column,
                meta: {...column.meta, sort: Boolean(sortable)},
            })) as TableColumnConfig<TableDataItem>[],
        [columns],
    );

    const sortedData = React.useMemo(
        () => sortRows(data, sortState, (id) => comparators.get(id)),
        [data, sortState, comparators],
    );

    const total = sortedData.length;
    // Страница могла «исчезнуть» после удаления строк или смены размера страницы.
    const currentPage = clampPage(page, pageSize, total);
    const pageData = React.useMemo(
        () => paginate(sortedData, currentPage, pageSize),
        [sortedData, currentPage, pageSize],
    );

    const getRowDescriptor = React.useCallback(
        (item: TableDataItem): DescriptorType => ({id: getRowId(item as T)}),
        [getRowId],
    );

    const handleSortStateChange = React.useCallback((next: TableSortState) => {
        setSortState(next);
        setPage(1);
    }, []);

    const handlePaginationUpdate = React.useCallback((nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    }, []);

    const selectedCount = selectedIds.length;
    const allSelected = React.useMemo(() => {
        const selected = new Set(selectedIds);
        return data.length > 0 && data.every((item) => selected.has(getRowId(item)));
    }, [data, selectedIds, getRowId]);

    return (
        <Flex direction="column" gap={3}>
            <Flex alignItems="center" gap={2} style={{minHeight: 28}}>
                {selectedCount > 0 ? (
                    <>
                        <Text variant="body-2">
                            Выбрано: {selectedCount} из {total}
                        </Text>
                        {!allSelected && (
                            <Button
                                view="flat-action"
                                size="m"
                                onClick={() => onSelectionChange(data.map(getRowId))}
                            >
                                Выбрать все ({total})
                            </Button>
                        )}
                        <Button view="flat" size="m" onClick={() => onSelectionChange([])}>
                            Снять выделение
                        </Button>
                        {selectionActions}
                    </>
                ) : (
                    <Text variant="body-2" color="secondary">
                        Всего записей: {total}. Shift + клик по заголовку — сортировка по нескольким
                        колонкам, Shift + клик по чекбоксу — выделение диапазона.
                    </Text>
                )}
            </Flex>

            <EnhancedTable
                data={pageData as TableDataItem[]}
                columns={tableColumns}
                getRowDescriptor={getRowDescriptor}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                sortState={sortState}
                onSortStateChange={handleSortStateChange}
                emptyMessage={emptyMessage}
                width="max"
            />

            {total > 0 && (
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={total}
                    pageSizeOptions={pageSizeOptions}
                    onUpdate={handlePaginationUpdate}
                    showInput
                />
            )}
        </Flex>
    );
}
