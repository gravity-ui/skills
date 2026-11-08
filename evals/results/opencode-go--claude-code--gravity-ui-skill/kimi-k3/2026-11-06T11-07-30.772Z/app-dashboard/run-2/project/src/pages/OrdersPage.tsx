import React from 'react';

import {Checkbox, Flex, Label, Text} from '@gravity-ui/uikit';
import {ColumnReorderingProvider, Table, useTable, type ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';

import {
    ORDERS,
    ORDER_STATUS_META,
    groupOrdersByStatus,
    isOrderGroup,
    type OrderTableItem,
} from '../data/orders';

const amountFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

// Custom selection column without range (Shift+click) selection: ranged
// selection is undefined behaviour for tables with nested/grouped rows.
const selectionColumn: ColumnDef<OrderTableItem> = {
    id: '_select',
    header: ({table}) => (
        <Checkbox
            size="l"
            checked={table.getIsAllRowsSelected()}
            disabled={!table.options.enableRowSelection}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
        />
    ),
    cell: ({row}) => (
        <Checkbox
            size="l"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
        />
    ),
    size: 40,
    minSize: 40,
    enableColumnReordering: false,
};

const columns: ColumnDef<OrderTableItem>[] = [
    selectionColumn,
    {
        id: 'number',
        header: 'Заказ',
        accessorFn: (item) => (isOrderGroup(item) ? '' : item.number),
        size: 140,
    },
    {
        id: 'customer',
        header: 'Клиент',
        accessorFn: (item) => (isOrderGroup(item) ? '' : item.customer),
        size: 200,
    },
    {
        id: 'status',
        header: 'Статус',
        accessorFn: (item) => item.status,
        cell: (info) => {
            const item = info.row.original;
            if (isOrderGroup(item)) {
                return null;
            }
            const meta = ORDER_STATUS_META[item.status];
            return <Label theme={meta.theme}>{meta.title}</Label>;
        },
        size: 160,
    },
    {
        id: 'date',
        header: 'Дата',
        accessorFn: (item) => (isOrderGroup(item) ? '' : dateFormatter.format(new Date(item.date))),
        size: 180,
    },
    {
        id: 'positions',
        header: 'Позиции',
        accessorFn: (item) => (isOrderGroup(item) ? '' : item.positions),
        size: 110,
    },
    {
        id: 'amount',
        header: 'Сумма',
        accessorFn: (item) => (isOrderGroup(item) ? '' : amountFormatter.format(item.amount)),
        size: 140,
    },
    {
        id: 'address',
        header: 'Адрес доставки',
        accessorFn: (item) => (isOrderGroup(item) ? '' : item.address),
        size: 300,
    },
];

const getGroupTitle = (row: Row<OrderTableItem>) => {
    const item = row.original;
    if (!isOrderGroup(item)) {
        return null;
    }
    const total = item.orders.reduce((sum, order) => sum + order.amount, 0);
    return `${ORDER_STATUS_META[item.status].groupTitle} · ${amountFormatter.format(total)}`;
};

export function OrdersPage() {
    const data = React.useMemo(() => groupOrdersByStatus(ORDERS), []);

    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

    const table = useTable({
        columns,
        data,
        getRowId: (item) => item.id,
        enableExpanding: true,
        getSubRows: (item) => (isOrderGroup(item) ? item.orders : undefined),
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        state: {
            rowSelection,
            expanded,
            columnOrder,
        },
    });

    const selectedCount = table
        .getSelectedRowModel()
        .rows.filter((row) => !isOrderGroup(row.original)).length;

    return (
        <div className="orders-page">
            <Flex alignItems="baseline" justifyContent="space-between" gap={4}>
                <Text variant="header-1">Заказы</Text>
                <Text variant="body-2" color="secondary">
                    Выбрано заказов: {selectedCount}
                </Text>
            </Flex>
            <Text variant="body-2" color="secondary">
                Строки сгруппированы по статусу заказа — группы можно сворачивать. Чтобы изменить
                порядок колонок, перетащите заголовок колонки в нужное место.
            </Text>
            <div className="orders-page__table">
                <ColumnReorderingProvider
                    table={table}
                    onReorder={({columnOrder: nextOrder, pinned}) => {
                        if (!pinned) {
                            setColumnOrder(nextOrder);
                        }
                    }}
                >
                    <Table
                        table={table}
                        stickyHeader
                        getGroupTitle={getGroupTitle}
                        getIsGroupHeaderRow={(row) => row.getCanExpand()}
                    />
                </ColumnReorderingProvider>
            </div>
        </div>
    );
}
