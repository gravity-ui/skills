import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import {
    Button,
    Pagination,
    Table,
    Text,
    withTableSelection,
    withTableSorting,
    type TableColumnConfig,
    type TableProps,
    type TableSortState,
    type WithTableSelectionProps,
    type WithTableSortingProps,
} from '@gravity-ui/uikit';

export interface DataTableRow {
    id: string;
}

export interface DataTableColumn<T extends DataTableRow> {
    id: string;
    title: string;
    render: (row: T) => ReactNode;
    /** Если задано — колонка сортируемая. Работает как `Array.prototype.sort`. */
    compare?: (a: T, b: T) => number;
    align?: 'start' | 'end';
    width?: number | string;
}

export interface DataTableProps<T extends DataTableRow> {
    data: T[];
    columns: DataTableColumn<T>[];
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    /** Вызывается с актуальным списком выбранных строк (из `data`). */
    onSelectionChange?: (rows: T[]) => void;
}

// Сортировка и пагинация делаются здесь, над полным набором данных, поэтому
// сортирующий HOC работает в controlled-режиме (sortState + onSortStateChange):
// он только рисует кликабельные заголовки и индикатор направления.
// Чекбоксы выбора добавляет HOC выбора; "выбрать все" относится к текущей странице.
// HOC типизированы под TableDataItem; приводим к дженерик-версии, чтобы
// render-функции и getRowDescriptor получали наш тип строки T.
const EnhancedTable = withTableSorting(withTableSelection(Table)) as unknown as <
    T extends DataTableRow,
>(
    props: TableProps<T> & WithTableSortingProps & WithTableSelectionProps<T>,
) => ReactElement | null;

function rowsByIds<T extends DataTableRow>(rows: T[], ids: string[]): T[] {
    const set = new Set(ids);
    return rows.filter((row) => set.has(row.id));
}

export function DataTable<T extends DataTableRow>({
    data,
    columns,
    pageSizeOptions = [10, 25, 50],
    defaultPageSize = 10,
    onSelectionChange,
}: DataTableProps<T>) {
    const [sortState, setSortState] = useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const sortedData = useMemo(() => {
        const comparators = sortState.flatMap(({ column, order }) => {
            const compare = columns.find((c) => c.id === column)?.compare;
            if (!compare) {
                return [];
            }
            const direction = order === 'asc' ? 1 : -1;
            return [(a: T, b: T) => direction * compare(a, b)];
        });

        if (comparators.length === 0) {
            return data;
        }

        return [...data].sort((a, b) => {
            for (const compare of comparators) {
                const result = compare(a, b);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        });
    }, [data, columns, sortState]);

    const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageRows = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const selectedRows = useMemo(() => rowsByIds(data, selectedIds), [data, selectedIds]);

    const tableColumns = useMemo<TableColumnConfig<T>[]>(
        () =>
            columns.map((column) => ({
                id: column.id,
                name: column.title,
                template: (row: T) => column.render(row),
                align: column.align,
                width: column.width,
                meta: column.compare ? { sort: true } : undefined,
            })),
        [columns],
    );

    const handleSelectionChange = useCallback(
        (ids: string[]) => {
            setSelectedIds(ids);
            onSelectionChange?.(rowsByIds(data, ids));
        },
        [data, onSelectionChange],
    );

    const handleSortChange = useCallback((next: TableSortState) => {
        setSortState(next);
        setPage(1);
    }, []);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 12,
                }}
            >
                <Text variant="body-2">Выбрано строк: {selectedRows.length}</Text>
                <Button
                    view="flat"
                    size="m"
                    disabled={selectedRows.length === 0}
                    onClick={() => handleSelectionChange([])}
                >
                    Снять выделение
                </Button>
            </div>

            <EnhancedTable
                data={pageRows}
                columns={tableColumns}
                getRowDescriptor={(row: T) => ({ id: row.id })}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                sortState={sortState}
                onSortStateChange={handleSortChange}
                width="max"
                edgePadding
                emptyMessage="Нет данных"
            />

            <div style={{ marginTop: 12 }}>
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    pageSizeOptions={pageSizeOptions}
                    showInput
                    onUpdate={(nextPage, nextPageSize) => {
                        setPage(nextPage);
                        setPageSize(nextPageSize);
                    }}
                />
            </div>
        </div>
    );
}
