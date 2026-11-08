import React from 'react';

import {
    ColumnReorderingProvider,
    Table,
    useRowSelectionFixedHandler,
    useTable,
    type ColumnDef,
} from '@gravity-ui/table';
import type {ExpandedState, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Checkbox, Flex, Label, Text} from '@gravity-ui/uikit';

import {
    GROUPED_ORDERS,
    STATUS_META,
    isOrder,
    isOrderGroup,
    type OrderRowData,
    type OrderStatus,
} from './ordersData';

import './OrdersPage.css';

const priceFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const columns: ColumnDef<OrderRowData>[] = [
    {
        id: '_select',
        enableColumnReordering: false,
        header: ({table}) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
            />
        ),
        cell: ({row}) => (
            <Checkbox
                checked={row.getIsSelected()}
                indeterminate={row.getIsSomeSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
            />
        ),
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableResizing: false,
    },
    {
        id: 'number',
        header: '№ заказа',
        accessorFn: (item) => (isOrder(item) ? item.number : null),
        size: 110,
    },
    {
        id: 'customer',
        header: 'Клиент',
        accessorFn: (item) => (isOrder(item) ? item.customer : null),
        size: 230,
    },
    {
        id: 'created',
        header: 'Дата',
        accessorFn: (item) => (isOrder(item) ? item.created : null),
        cell: ({getValue}) => {
            const value = getValue<string | null>();
            return value === null ? null : dateFormatter.format(new Date(value));
        },
        size: 170,
    },
    {
        id: 'itemsCount',
        header: 'Позиций',
        accessorFn: (item) => (isOrder(item) ? item.itemsCount : null),
        size: 100,
    },
    {
        id: 'total',
        header: 'Сумма',
        accessorFn: (item) => (isOrder(item) ? item.total : null),
        cell: ({getValue}) => {
            const value = getValue<number | null>();
            return value === null ? null : priceFormatter.format(value);
        },
        size: 140,
    },
    {
        id: 'status',
        header: 'Статус',
        accessorFn: (item) => (isOrder(item) ? item.status : null),
        cell: ({getValue}) => {
            const status = getValue<OrderStatus | null>();
            if (status === null) {
                return null;
            }
            const meta = STATUS_META[status];
            return <Label theme={meta.theme}>{meta.title}</Label>;
        },
        size: 150,
    },
];

export function OrdersPage() {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

    const getRowId = React.useCallback((item: OrderRowData) => item.id, []);
    const getSubRows = React.useCallback(
        (item: OrderRowData) => (isOrderGroup(item) ? item.orders : undefined),
        [],
    );

    // Correct parent/header checkbox state for grouped (nested) rows,
    // see https://github.com/TanStack/table/issues/4878
    const handleRowSelectionChange = useRowSelectionFixedHandler({
        rowSelection,
        setRowSelection,
        tableData: GROUPED_ORDERS,
        getSubRows,
        getRowId,
    });

    const table = useTable({
        columns,
        data: GROUPED_ORDERS,
        getRowId,
        getSubRows,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableExpanding: true,
        onRowSelectionChange: handleRowSelectionChange,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        state: {
            rowSelection,
            expanded,
            columnOrder,
        },
    });

    const selectedOrdersCount = React.useMemo(
        () => Object.keys(rowSelection).filter((id) => !id.startsWith('group-')).length,
        [rowSelection],
    );

    return (
        <div className="orders-page">
            <Flex
                className="orders-page__header"
                alignItems="flex-end"
                justifyContent="space-between"
                gap={4}
            >
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                    <Text variant="header-1">Заказы</Text>
                    <Text variant="body-2" color="secondary">
                        Строки сгруппированы по статусу. Перетаскивайте заголовки, чтобы менять
                        колонки местами.
                    </Text>
                </Flex>
                <Text variant="body-2" color="secondary" style={{flexShrink: 0}}>
                    Выбрано заказов: {selectedOrdersCount}
                </Text>
            </Flex>
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
                        getIsGroupHeaderRow={(row) => isOrderGroup(row.original)}
                        getGroupTitle={(row) =>
                            isOrderGroup(row.original)
                                ? STATUS_META[row.original.status].title
                                : row.id
                        }
                    />
                </ColumnReorderingProvider>
            </div>
        </div>
    );
}
