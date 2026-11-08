import { useCallback, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
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
    TableProps,
    TableSortState,
    WithTableSelectionProps,
    WithTableSortingProps,
} from '@gravity-ui/uikit';

// Порядок HOC важен: чекбоксы добавляются как самая левая колонка, сортировка — в заголовки.
const EnhancedTable = withTableSelection(withTableSorting(Table));

// HOC создаются один раз на уровне модуля, поэтому тип строки сужаем приведением.
type EnhancedTableProps<I> = TableProps<I> & WithTableSortingProps & WithTableSelectionProps<I>;
function getEnhancedTable<I extends TableDataItem>() {
    return EnhancedTable as unknown as ComponentType<EnhancedTableProps<I>>;
}

const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

export type SortCompare<I> = (a: I, b: I) => number;

export interface DataTableColumn<I> extends TableColumnConfig<I> {
    /** `true` — сортировка по значению поля `id`, функция — собственный компаратор. */
    sortable?: boolean | SortCompare<I>;
}

export interface DataTableProps<I extends TableDataItem> {
    data: I[];
    columns: DataTableColumn<I>[];
    getRowId: (item: I) => string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
    defaultSortState?: TableSortState;
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    emptyMessage?: string;
}

function compareValues(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    return collator.compare(String(a), String(b));
}

function isEmpty(value: unknown) {
    return value === null || value === undefined || value === '';
}

export function DataTable<I extends TableDataItem>({
    data,
    columns,
    getRowId,
    selectedIds,
    onSelectionChange,
    defaultSortState = [],
    pageSizeOptions = [10, 20, 50],
    defaultPageSize = pageSizeOptions[0],
    emptyMessage = 'Нет данных',
}: DataTableProps<I>) {
    const TypedTable = getEnhancedTable<I>();
    const [sortState, setSortState] = useState<TableSortState>(defaultSortState);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const comparators = useMemo(() => {
        const map = new Map<string, SortCompare<I>>();
        for (const column of columns) {
            if (typeof column.sortable === 'function') {
                map.set(column.id, column.sortable);
            } else if (column.sortable) {
                map.set(column.id, (a, b) => compareValues(a[column.id], b[column.id]));
            }
        }
        return map;
    }, [columns]);

    // HOC сортировки сам отрисовывает индикаторы в заголовках колонок с `meta.sort`.
    // Данные сортируем здесь, по всему набору, иначе сортировалась бы только текущая страница.
    const tableColumns = useMemo<TableColumnConfig<I>[]>(
        () =>
            columns.map(({ sortable, ...column }) =>
                sortable ? { ...column, meta: { ...column.meta, sort: true } } : column,
            ),
        [columns],
    );

    const sortedData = useMemo(() => {
        const rules = sortState
            .map((s) => ({ order: s.order, compare: comparators.get(s.column), id: s.column }))
            .filter((r) => r.compare);
        if (rules.length === 0) return data;

        return data
            .map((item, index) => ({ item, index }))
            .sort((x, y) => {
                for (const { id, order, compare } of rules) {
                    // Пустые значения всегда в конце, независимо от направления.
                    const emptyX = isEmpty(x.item[id]);
                    const emptyY = isEmpty(y.item[id]);
                    if (emptyX !== emptyY) return emptyX ? 1 : -1;
                    const result = compare!(x.item, y.item);
                    if (result !== 0) return order === 'asc' ? result : -result;
                }
                return x.index - y.index; // стабильная сортировка
            })
            .map(({ item }) => item);
    }, [data, sortState, comparators]);

    const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageData = useMemo(
        () => sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sortedData, currentPage, pageSize],
    );

    const handleSortChange = (next: TableSortState) => {
        setSortState(next);
        setPage(1);
    };

    const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
        if (nextPageSize !== pageSize) {
            // Сохраняем в зоне видимости первую строку текущей страницы.
            const firstIndex = (currentPage - 1) * pageSize;
            setPageSize(nextPageSize);
            setPage(Math.floor(firstIndex / nextPageSize) + 1);
        } else {
            setPage(nextPage);
        }
    };

    // Стабильная ссылка: HOC выделения мемоизирует обёртку по этой функции.
    const getRowDescriptor = useCallback((item: I) => ({ id: getRowId(item) }), [getRowId]);

    const allIds = useMemo(() => data.map(getRowId), [data, getRowId]);
    const selectedCount = selectedIds.length;
    const allSelected = selectedCount > 0 && selectedCount === allIds.length;

    return (
        <Flex direction="column" gap={3}>
            <Flex alignItems="center" gap={3} style={{ minHeight: 28 }}>
                {selectedCount > 0 ? (
                    <>
                        <Text variant="subheader-1">
                            Выбрано: {selectedCount} из {allIds.length}
                        </Text>
                        {!allSelected && (
                            <Button view="flat-action" size="s" onClick={() => onSelectionChange(allIds)}>
                                Выбрать все {allIds.length}
                            </Button>
                        )}
                        <Button view="flat-secondary" size="s" onClick={() => onSelectionChange([])}>
                            Снять выделение
                        </Button>
                    </>
                ) : (
                    <Text color="secondary">
                        Всего записей: {allIds.length}. Shift + клик по заголовку — сортировка по
                        нескольким колонкам, Shift + клик по чекбоксу — выделение диапазона.
                    </Text>
                )}
            </Flex>

            <TypedTable
                data={pageData}
                columns={tableColumns}
                getRowDescriptor={getRowDescriptor}
                sortState={sortState}
                onSortStateChange={handleSortChange}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                emptyMessage={emptyMessage}
                width="max"
            />

            {sortedData.length > 0 && (
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sortedData.length}
                    pageSizeOptions={pageSizeOptions}
                    onUpdate={handlePaginationUpdate}
                    showInput
                />
            )}
        </Flex>
    );
}
