import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
    Button,
    Pagination,
    Table,
    Text,
    withTableSelection,
    withTableSorting,
} from '@gravity-ui/uikit';
import type {
    TableColumnConfig,
    TableColumnSortState,
    TableDataItem,
    TableProps,
    WithTableSelectionProps,
    WithTableSortingProps,
} from '@gravity-ui/uikit';

export interface DataColumn<T> {
    id: string;
    name: string;
    /** Значение ячейки: используется для сортировки и как содержимое по умолчанию */
    getValue: (row: T) => string | number;
    /** Произвольная отрисовка ячейки (например, форматирование) */
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    align?: 'start' | 'end';
    width?: number | string;
}

export interface DataTableProps<T extends TableDataItem> {
    data: T[];
    columns: DataColumn<T>[];
    /** Стабильный уникальный идентификатор строки */
    getRowId: (row: T) => string;
    pageSizeOptions?: number[];
    initialPageSize?: number;
    onSelectionChange?: (ids: string[]) => void;
}

// Выделение чекбоксами и индикатор сортировки берём из HOC uikit.
// Сортировку данных делаем сами (controlled), чтобы пагинация резала уже отсортированный массив.
// HOC типизированы через TableDataItem и не выводят дженерик строки, поэтому задаём сигнатуру явно.
type SelectableTableProps<T extends TableDataItem> = TableProps<T> &
    WithTableSelectionProps<T> &
    WithTableSortingProps;

const SelectableTable = withTableSelection(withTableSorting(Table)) as unknown as <
    T extends TableDataItem,
>(
    props: SelectableTableProps<T>,
) => React.ReactElement;

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

function compareValues(a: string | number, b: string | number): number {
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    return collator.compare(String(a), String(b));
}

export function DataTable<T extends TableDataItem>({
    data,
    columns,
    getRowId,
    pageSizeOptions = [5, 10, 20, 50],
    initialPageSize = 10,
    onSelectionChange,
}: DataTableProps<T>) {
    const [sort, setSort] = useState<TableColumnSortState[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const columnsById = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);

    // Сортировка: поддерживается несколько колонок (Shift + клик в заголовке), порядок правил = порядок клика
    const sortedData = useMemo(() => {
        if (sort.length === 0) {
            return data;
        }
        const rules = sort.flatMap((s) => {
            const column = columnsById.get(s.column);
            return column ? [{ column, direction: s.order === 'asc' ? 1 : -1 }] : [];
        });
        return [...data].sort((a, b) => {
            for (const { column, direction } of rules) {
                const result = compareValues(column.getValue(a), column.getValue(b));
                if (result !== 0) {
                    return result * direction;
                }
            }
            return 0;
        });
    }, [data, sort, columnsById]);

    // Пагинация: если данные уменьшились, не даём уйти за последнюю страницу
    const total = sortedData.length;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, lastPage);
    const pageRows = useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize],
    );

    // Выделение переживает сортировку и переходы по страницам,
    // но отбрасывает id строк, которых больше нет в data
    const rowIds = useMemo(() => new Set(data.map((row) => getRowId(row))), [data, getRowId]);
    const selected = useMemo(() => selectedIds.filter((id) => rowIds.has(id)), [selectedIds, rowIds]);

    const handleSelectionChange = useCallback(
        (ids: string[]) => {
            setSelectedIds(ids);
            onSelectionChange?.(ids);
        },
        [onSelectionChange],
    );

    const handleSortChange = useCallback((next: TableColumnSortState[]) => {
        setSort(next);
        setPage(1);
    }, []);

    const handlePaginationUpdate = useCallback((nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    }, []);

    const tableColumns: TableColumnConfig<T>[] = useMemo(
        () =>
            columns.map((column) => ({
                id: column.id,
                name: column.name,
                align: column.align,
                width: column.width,
                // Наличие meta.sort включает кнопку сортировки в заголовке (см. withTableSorting)
                meta: column.sortable ? { sort: true } : undefined,
                template: (row: T) => (column.render ? column.render(row) : column.getValue(row)),
            })),
        [columns],
    );

    const getRowDescriptor = useCallback((row: T) => ({ id: getRowId(row) }), [getRowId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="body-1">
                    Выбрано: {selected.length} из {total}
                </Text>
                <Button
                    view="flat"
                    size="m"
                    disabled={selected.length === 0}
                    onClick={() => handleSelectionChange([])}
                >
                    Снять выделение
                </Button>
            </div>

            <SelectableTable
                data={pageRows}
                columns={tableColumns}
                getRowDescriptor={getRowDescriptor}
                selectedIds={selected}
                onSelectionChange={handleSelectionChange}
                sortState={sort}
                onSortStateChange={handleSortChange}
                emptyMessage="Нет данных"
            />

            <Pagination
                page={currentPage}
                pageSize={pageSize}
                total={total}
                pageSizeOptions={pageSizeOptions}
                showInput
                onUpdate={handlePaginationUpdate}
            />
        </div>
    );
}
