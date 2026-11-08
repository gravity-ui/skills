import * as React from 'react';

import {
    ColumnReorderingProvider,
    Table,
    selectionColumn,
    useRowSelectionFixedHandler,
    useTable,
} from '@gravity-ui/table';
import type {BaseGroupHeaderProps, ColumnDef} from '@gravity-ui/table';
import type {
    ColumnOrderState,
    ExpandedState,
    Row,
    RowSelectionState,
} from '@gravity-ui/table/tanstack';
import {ArrowRotateLeft} from '@gravity-ui/icons';
import {ArrowToggle, Button, Checkbox, Flex, Icon, Label, Switch, Text} from '@gravity-ui/uikit';

import {
    GROUP_ID_PREFIX,
    STATUS_META,
    formatCurrency,
    formatDate,
    generateOrders,
    groupOrdersByStatus,
    isOrderGroup,
    pluralizeOrders,
} from './data';
import type {Order, OrderRow} from './data';

const ORDERS = generateOrders(160);
const ORDERS_BY_ID = new Map(ORDERS.map((order) => [order.id, order]));
const GROUPED_ORDERS = groupOrdersByStatus(ORDERS);

const getRowId = (item: OrderRow) => item.id;
const getSubRows = (item: OrderRow) => (isOrderGroup(item) ? item.items : undefined);
const getIsGroupHeaderRow = (row: Row<OrderRow>) => isOrderGroup(row.original);

/** Reads an order field; group rows are rendered by the group header, so they never reach cells. */
const orderField =
    <K extends keyof Order>(key: K) =>
    (item: OrderRow) =>
        isOrderGroup(item) ? undefined : item[key];

/**
 * Plain selection column for grouped mode: the ranged (Shift+click) checkbox of the built-in
 * `selectionColumn` is undefined behavior with nested rows.
 */
const groupedSelectionColumn: ColumnDef<OrderRow> = {
    id: '_select',
    header: ({table}) => (
        <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            controlProps={{'aria-label': 'Выбрать все заказы'}}
        />
    ),
    cell: ({row}) => (
        <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
            controlProps={{'aria-label': 'Выбрать заказ'}}
        />
    ),
    size: 32,
    minSize: 32,
    enableColumnReordering: false,
};

const flatSelectionColumn: ColumnDef<OrderRow> = {
    ...(selectionColumn as ColumnDef<OrderRow>),
    enableColumnReordering: false,
};

const dataColumns: ColumnDef<OrderRow>[] = [
    {
        id: 'number',
        header: 'Номер',
        accessorFn: orderField('number'),
        size: 100,
        cell: ({getValue}) => <Text variant="code-1">{getValue<string>()}</Text>,
    },
    {
        id: 'customer',
        header: 'Клиент',
        accessorFn: orderField('customer'),
        size: 240,
        cell: ({row, getValue}) => {
            const order = row.original as Order;
            return (
                <Flex direction="column">
                    <Text ellipsis>{getValue<string>()}</Text>
                    <Text variant="caption-2" color="secondary" ellipsis>
                        {order.email}
                    </Text>
                </Flex>
            );
        },
    },
    {
        id: 'status',
        header: 'Статус',
        accessorFn: orderField('status'),
        size: 140,
        cell: ({row}) => {
            const meta = STATUS_META[(row.original as Order).status];
            return <Label theme={meta.theme}>{meta.title}</Label>;
        },
    },
    {
        id: 'amount',
        header: 'Сумма',
        accessorFn: orderField('amount'),
        size: 130,
        cell: ({getValue}) => <Text>{formatCurrency(getValue<number>())}</Text>,
    },
    {
        id: 'createdAt',
        header: 'Создан',
        accessorFn: orderField('createdAt'),
        size: 160,
        cell: ({getValue}) => <Text color="secondary">{formatDate(getValue<string>())}</Text>,
    },
    {
        id: 'payment',
        header: 'Оплата',
        accessorFn: orderField('payment'),
        size: 170,
    },
    {
        id: 'city',
        header: 'Город',
        accessorFn: orderField('city'),
        size: 170,
    },
    {
        id: 'manager',
        header: 'Менеджер',
        accessorFn: orderField('manager'),
        size: 140,
    },
];

const groupedColumns = [groupedSelectionColumn, ...dataColumns];
const flatColumns = [flatSelectionColumn, ...dataColumns];

function OrdersGroupHeader({row, className}: BaseGroupHeaderProps<OrderRow>) {
    const group = row.original;
    if (!isOrderGroup(group)) {
        return null;
    }

    const meta = STATUS_META[group.status];
    const total = group.items.reduce((sum, order) => sum + order.amount, 0);
    const expanded = row.getIsExpanded();

    return (
        <Flex className={className} alignItems="center" gap={3}>
            <Checkbox
                checked={row.getIsAllSubRowsSelected()}
                indeterminate={row.getIsSomeSelected()}
                onChange={row.getToggleSelectedHandler()}
                controlProps={{'aria-label': `Выбрать все заказы со статусом «${meta.title}»`}}
            />
            <Button
                view="flat"
                size="s"
                onClick={row.getToggleExpandedHandler()}
                aria-expanded={expanded}
                aria-label={expanded ? 'Свернуть группу' : 'Развернуть группу'}
            >
                <ArrowToggle direction={expanded ? 'bottom' : 'right'} />
            </Button>
            <Label theme={meta.theme} size="s">
                {meta.title}
            </Label>
            <Text color="secondary">{pluralizeOrders(group.items.length)}</Text>
            <Text color="secondary">·</Text>
            <Text color="secondary">{formatCurrency(total)}</Text>
        </Flex>
    );
}

export function OrdersTable() {
    const [grouped, setGrouped] = React.useState(true);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);

    const data: OrderRow[] = grouped ? GROUPED_ORDERS : ORDERS;

    // Keeps the group checkbox state consistent with its children (TanStack issue #4878).
    const handleRowSelectionChange = useRowSelectionFixedHandler<OrderRow>({
        rowSelection,
        setRowSelection,
        tableData: data,
        getSubRows,
        getRowId,
    });

    const table = useTable<OrderRow>({
        columns: grouped ? groupedColumns : flatColumns,
        data,
        getRowId,
        getSubRows,
        enableExpanding: grouped,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: grouped ? handleRowSelectionChange : setRowSelection,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        state: {
            rowSelection,
            expanded,
            columnOrder,
        },
    });

    const selectedOrders = React.useMemo(
        () =>
            Object.keys(rowSelection)
                .filter((id) => rowSelection[id] && !id.startsWith(GROUP_ID_PREFIX))
                .map((id) => ORDERS_BY_ID.get(id))
                .filter((order): order is Order => Boolean(order)),
        [rowSelection],
    );
    const selectedTotal = selectedOrders.reduce((sum, order) => sum + order.amount, 0);

    const handleRowClick = React.useCallback(
        (row: Row<OrderRow>, event: React.MouseEvent<HTMLTableRowElement>) => {
            // Checkboxes and buttons handle their own clicks.
            if ((event.target as HTMLElement).closest('label, input, button, a')) {
                return;
            }
            if (!isOrderGroup(row.original)) {
                row.toggleSelected();
            }
        },
        [],
    );

    const handleToggleGrouping = (value: boolean) => {
        setGrouped(value);
        setExpanded(true);
        // Group ids are meaningless in the flat list; keep only the selected orders.
        setRowSelection((prev) =>
            Object.fromEntries(
                Object.entries(prev).filter(([id]) => !id.startsWith(GROUP_ID_PREFIX)),
            ),
        );
    };

    const allExpanded = table.getIsAllRowsExpanded();

    return (
        <Flex direction="column" gap={3} className="orders">
            <Flex className="orders__toolbar" alignItems="center" gap={3} wrap>
                <Switch checked={grouped} onUpdate={handleToggleGrouping}>
                    Группировать по статусу
                </Switch>
                {grouped && (
                    <Button view="flat" size="m" onClick={() => table.toggleAllRowsExpanded(!allExpanded)}>
                        {allExpanded ? 'Свернуть все группы' : 'Развернуть все группы'}
                    </Button>
                )}
                <Button
                    view="flat"
                    size="m"
                    disabled={columnOrder.length === 0}
                    onClick={() => setColumnOrder([])}
                >
                    <Icon data={ArrowRotateLeft} />
                    Сбросить порядок колонок
                </Button>
                <div className="orders__spacer" />
                {selectedOrders.length > 0 ? (
                    <Flex alignItems="center" gap={3} wrap>
                        <Text>
                            Выбрано: {pluralizeOrders(selectedOrders.length)} на{' '}
                            {formatCurrency(selectedTotal)}
                        </Text>
                        <Button view="outlined" size="m" onClick={() => setRowSelection({})}>
                            Снять выделение
                        </Button>
                    </Flex>
                ) : (
                    <Text color="secondary">
                        Всего: {pluralizeOrders(ORDERS.length)}. Перетаскивайте заголовки, чтобы
                        менять колонки местами
                    </Text>
                )}
            </Flex>

            <div className="orders__scroll">
                <ColumnReorderingProvider
                    table={table}
                    onReorder={({columnOrder: nextOrder}) => setColumnOrder(nextOrder)}
                >
                    <Table
                        table={table}
                        stickyHeader
                        className="orders__table"
                        getIsGroupHeaderRow={getIsGroupHeaderRow}
                        renderGroupHeader={(props) => <OrdersGroupHeader {...props} />}
                        onRowClick={handleRowClick}
                        emptyContent={<Text color="secondary">Заказов нет</Text>}
                    />
                </ColumnReorderingProvider>
            </div>
        </Flex>
    );
}
