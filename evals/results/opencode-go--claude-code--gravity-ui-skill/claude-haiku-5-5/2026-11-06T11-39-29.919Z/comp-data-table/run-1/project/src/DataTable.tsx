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
import type { TableColumnConfig, TableSortState, WithTableSortingProps } from '@gravity-ui/uikit';

import { type Order, type OrderStatus } from './data';

type Sorter = (a: Order, b: Order) => number;

const sorters = {
    id: (a, b) => a.id.localeCompare(b.id, 'ru', { numeric: true }),
    client: (a, b) => a.client.localeCompare(b.client, 'ru'),
    amount: (a, b) => a.amount - b.amount,
    createdAt: (a, b) => a.createdAt - b.createdAt,
} satisfies Record<string, Sorter>;

const STATUS_LABELS: Record<OrderStatus, string> = {
    new: 'Новый',
    paid: 'Оплачен',
    shipped: 'Отправлен',
    cancelled: 'Отменён',
};

const STATUS_THEMES: Record<OrderStatus, 'info' | 'success' | 'warning' | 'danger'> = {
    new: 'info',
    paid: 'success',
    shipped: 'warning',
    cancelled: 'danger',
};

const moneyFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

const COLUMNS: TableColumnConfig<Order>[] = [
    { id: 'id', name: 'Заказ', meta: { sort: sorters.id } },
    { id: 'client', name: 'Клиент', meta: { sort: sorters.client } },
    {
        id: 'amount',
        name: 'Сумма',
        align: 'end',
        template: (item) => moneyFormat.format(item.amount),
        meta: { sort: sorters.amount, defaultSortOrder: 'desc' },
    },
    {
        id: 'createdAt',
        name: 'Дата',
        template: (item) => dateFormat.format(item.createdAt),
        meta: { sort: sorters.createdAt, defaultSortOrder: 'desc' },
    },
    {
        id: 'status',
        name: 'Статус',
        template: (item) => (
            <Label theme={STATUS_THEMES[item.status]} size="s">
                {STATUS_LABELS[item.status]}
            </Label>
        ),
    },
];

// Сортировка выполняется здесь, до пагинации, чтобы страница отражала весь набор данных.
// Порядок ключей соответствует `sortState` из withTableSorting: первый ключ — главный.
function sortOrders(items: Order[], sortState: TableSortState): Order[] {
    if (sortState.length === 0) {
        return items;
    }

    return items.slice().sort((a, b) => {
        for (const { column, order } of sortState) {
            const sorter = sorters[column as keyof typeof sorters] as Sorter | undefined;
            if (!sorter) {
                continue;
            }
            const result = sorter(a, b);
            if (result !== 0) {
                return order === 'asc' ? result : -result;
            }
        }
        return 0;
    });
}

// Определены на уровне модуля: HOC мемоизируют по ссылке, и inline-функции
// приводили бы к росту кэша при каждом рендере.
const SelectableSortableTable = withTableSelection<Order, WithTableSortingProps>(
    withTableSorting<Order>(Table),
);
const getRowDescriptor = (item: Order) => ({ id: item.id });
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type DataTableProps = {
    data: Order[];
};

export function DataTable({ data }: DataTableProps) {
    const [sortState, setSortState] = React.useState<TableSortState>([]);
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(PAGE_SIZE_OPTIONS[1]);

    const sorted = React.useMemo(() => sortOrders(data, sortState), [data, sortState]);

    // Страница может выйти за пределы после уменьшения данных или размера страницы — зажимаем её.
    const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageItems = React.useMemo(
        () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [sorted, currentPage, pageSize],
    );

    const handleSortStateChange = (nextSortState: TableSortState) => {
        setSortState(nextSortState);
        setPage(1);
    };

    const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
    };

    return (
        <Flex direction="column" gap={4}>
            <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                <Text variant="subheader-2">Выбрано строк: {selectedIds.length}</Text>
                <Button
                    view="flat"
                    size="s"
                    disabled={selectedIds.length === 0}
                    onClick={() => setSelectedIds([])}
                >
                    Сбросить выбор
                </Button>
            </Flex>

            <SelectableSortableTable
                data={pageItems}
                columns={COLUMNS}
                getRowDescriptor={getRowDescriptor}
                emptyMessage="Нет данных"
                sortState={sortState}
                onSortStateChange={handleSortStateChange}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
            />

            <Flex justifyContent="flex-end" wrap>
                <Pagination
                    page={currentPage}
                    pageSize={pageSize}
                    total={sorted.length}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    onUpdate={handlePaginationUpdate}
                    showInput
                />
            </Flex>
        </Flex>
    );
}
