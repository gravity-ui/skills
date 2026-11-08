import React from 'react';

import {
    ColumnReorderingProvider,
    Table,
    selectionColumn,
    useRowSelectionFixedHandler,
    useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {
    CellContext,
    ExpandedState,
    Row,
    RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {Button, Flex, Label, Text} from '@gravity-ui/uikit';

import {
    GROUPED_ORDERS,
    ORDER_STATUS_META,
    Order,
    OrderTableItem,
    formatDate,
    formatTotal,
    isStatusGroup,
} from './orders';

const getRowId = (item: OrderTableItem) => item.id;

const getSubRows = (item: OrderTableItem) => (isStatusGroup(item) ? item.items : undefined);

const getIsGroupHeaderRow = (row: Row<OrderTableItem>) => isStatusGroup(row.original);

const getGroupTitle = (row: Row<OrderTableItem>) => {
    const original = row.original;
    if (!isStatusGroup(original)) {
        return row.id;
    }
    const meta = ORDER_STATUS_META[original.status];
    return <Label theme={meta.theme}>{meta.label}</Label>;
};

const statusCell = (info: CellContext<OrderTableItem, unknown>) => {
    const item = info.row.original;
    if (isStatusGroup(item)) {
        return null;
    }
    const meta = ORDER_STATUS_META[(item as Order).status];
    return <Label theme={meta.theme}>{meta.label}</Label>;
};

const columns: ColumnDef<OrderTableItem>[] = [
    {...selectionColumn, enableColumnReordering: false} as ColumnDef<OrderTableItem>,
    {
        id: 'number',
        accessorFn: (item) => (isStatusGroup(item) ? '' : item.number),
        header: '№ заказа',
        size: 110,
    },
    {
        id: 'customer',
        accessorFn: (item) => (isStatusGroup(item) ? '' : item.customer),
        header: 'Клиент',
        size: 230,
    },
    {
        id: 'city',
        accessorFn: (item) => (isStatusGroup(item) ? '' : item.city),
        header: 'Город',
        size: 160,
    },
    {
        id: 'createdAt',
        accessorFn: (item) => (isStatusGroup(item) ? '' : formatDate(item.createdAt)),
        header: 'Дата',
        size: 120,
    },
    {
        id: 'itemsCount',
        accessorFn: (item) => (isStatusGroup(item) ? '' : item.itemsCount),
        header: 'Позиций',
        size: 90,
    },
    {
        id: 'total',
        accessorFn: (item) => (isStatusGroup(item) ? '' : formatTotal(item.total)),
        header: 'Сумма',
        size: 130,
    },
    {
        id: 'status',
        accessorFn: (item) =>
            isStatusGroup(item) ? '' : ORDER_STATUS_META[item.status].label,
        header: 'Статус',
        size: 140,
        cell: statusCell,
    },
];

export function OrdersTable() {
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

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
        enableExpanding: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        getRowId,
        getSubRows,
        onExpandedChange: setExpanded,
        onRowSelectionChange: handleRowSelectionChange,
        state: {
            expanded,
            rowSelection,
        },
    });

    const selectedCount = Object.keys(rowSelection).filter(
        (key) => rowSelection[key] && key.startsWith('ord-'),
    ).length;

    return (
        <Flex direction="column" gap={3}>
            <Flex alignItems="center" gap={3}>
                <Text variant="body-2" color="secondary" style={{flex: 1, minWidth: 0}}>
                    {selectedCount > 0
                        ? `Выбрано заказов: ${selectedCount}`
                        : 'Строки выделяются чекбоксами, колонки перетаскиваются за заголовок, строки сгруппированы по статусу'}
                </Text>
                {selectedCount > 0 ? (
                    <Button
                        view="flat"
                        size="m"
                        style={{flexShrink: 0}}
                        onClick={() => setRowSelection({})}
                    >
                        Снять выделение
                    </Button>
                ) : null}
            </Flex>
            <div style={{maxWidth: '100%', overflowX: 'auto'}}>
                <ColumnReorderingProvider table={table}>
                    <Table
                        table={table}
                        getIsGroupHeaderRow={getIsGroupHeaderRow}
                        getGroupTitle={getGroupTitle}
                    />
                </ColumnReorderingProvider>
            </div>
        </Flex>
    );
}
