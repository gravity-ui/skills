import * as React from 'react';

import {ChevronDown, ChevronRight} from '@gravity-ui/icons';
import {ColumnReorderingProvider, Table, useTable} from '@gravity-ui/table';
import type {
    BaseGroupHeaderProps,
    ColumnDef,
    ColumnReorderingProviderProps,
} from '@gravity-ui/table';
import type {
    ColumnPinningState,
    ExpandedState,
    Row,
    RowSelectionState,
    SortingState,
} from '@gravity-ui/table/tanstack';
import {Button, Checkbox, Flex, Icon, Label, Switch, Text} from '@gravity-ui/uikit';

import {
    ORDERS,
    PAYMENT_TITLE,
    STATUS_META,
    STATUS_ORDER,
    formatDate,
    formatMoney,
} from './data';
import type {Order, OrderStatus} from './data';

const SELECT_COLUMN_ID = 'select';

function pluralizeOrders(count: number) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} заказ`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} заказа`;
    return `${count} заказов`;
}

/** Stops clicks on in-row controls from also triggering the row click handler. */
const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

const selectionColumn: ColumnDef<Order> = {
    id: SELECT_COLUMN_ID,
    header: ({table}) => (
        <Checkbox
            size="l"
            title="Выделить все заказы"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onUpdate={(checked) => table.toggleAllRowsSelected(checked)}
        />
    ),
    cell: ({row}) => (
        <span onClick={stopPropagation}>
            <Checkbox
                size="l"
                title={`Выделить заказ ${row.original.number}`}
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onUpdate={(checked) => row.toggleSelected(checked)}
            />
        </span>
    ),
    size: 48,
    minSize: 48,
    maxSize: 48,
    enableSorting: false,
    enableGrouping: false,
    enableColumnReordering: false,
};

const dataColumns: ColumnDef<Order>[] = [
    {
        id: 'number',
        accessorKey: 'number',
        header: 'Заказ',
        size: 110,
        cell: ({getValue}) => <Text variant="subheader-1">{getValue<string>()}</Text>,
    },
    {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Создан',
        size: 170,
        cell: ({getValue}) => formatDate(getValue<string>()),
    },
    {
        id: 'customer',
        accessorKey: 'customer',
        header: 'Клиент',
        size: 220,
    },
    {
        id: 'city',
        accessorKey: 'city',
        header: 'Город',
        size: 170,
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Статус',
        size: 140,
        sortingFn: (a, b) =>
            STATUS_ORDER.indexOf(a.getValue<OrderStatus>('status')) -
            STATUS_ORDER.indexOf(b.getValue<OrderStatus>('status')),
        cell: ({getValue}) => {
            const meta = STATUS_META[getValue<OrderStatus>()];
            return (
                <Label theme={meta.theme} size="s">
                    {meta.title}
                </Label>
            );
        },
    },
    {
        id: 'items',
        accessorKey: 'items',
        header: 'Товаров',
        size: 110,
    },
    {
        id: 'payment',
        accessorKey: 'payment',
        header: 'Оплата',
        size: 130,
        cell: ({getValue}) => PAYMENT_TITLE[getValue<Order['payment']>()],
    },
    {
        id: 'total',
        accessorKey: 'total',
        header: 'Сумма',
        size: 140,
        cell: ({getValue}) => <Text variant="body-1">{formatMoney(getValue<number>())}</Text>,
    },
];

const columns: ColumnDef<Order>[] = [selectionColumn, ...dataColumns];

/** Orders sorted by status lifecycle (stable), so status groups appear in a predictable order. */
const ORDERS_BY_STATUS = [...ORDERS].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
);

function StatusGroupHeader({row, className}: BaseGroupHeaderProps<Order>) {
    const status = row.groupingValue as OrderStatus;
    const meta = STATUS_META[status];
    const leafRows = row.getLeafRows();
    const groupTotal = leafRows.reduce((sum, leaf) => sum + leaf.original.total, 0);
    const isExpanded = row.getIsExpanded();
    const isAllSelected = leafRows.length > 0 && leafRows.every((leaf) => leaf.getIsSelected());
    const isSomeSelected = !isAllSelected && leafRows.some((leaf) => leaf.getIsSelected());

    return (
        <Flex className={className} alignItems="center" gap={2}>
            <Checkbox
                size="l"
                title={`Выделить группу «${meta.title}»`}
                checked={isAllSelected}
                indeterminate={isSomeSelected}
                onUpdate={(checked) => row.toggleSelected(checked)}
            />
            <Button
                view="flat"
                size="s"
                onClick={row.getToggleExpandedHandler()}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Свернуть группу' : 'Развернуть группу'}
            >
                <Icon data={isExpanded ? ChevronDown : ChevronRight} size={16} />
            </Button>
            <Label theme={meta.theme} size="s">
                {meta.title}
            </Label>
            <Text color="secondary">
                {pluralizeOrders(leafRows.length)} · {formatMoney(groupTotal)}
            </Text>
        </Flex>
    );
}

const renderGroupHeader = (props: BaseGroupHeaderProps<Order>) => <StatusGroupHeader {...props} />;
const getIsGroupHeaderRow = (row: Row<Order>) => row.getIsGrouped();

export function OrdersTable() {
    const [groupByStatus, setGroupByStatus] = React.useState(true);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [SELECT_COLUMN_ID],
    });
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);

    const grouping = React.useMemo(() => (groupByStatus ? ['status'] : []), [groupByStatus]);
    const data = groupByStatus ? ORDERS_BY_STATUS : ORDERS;

    const table = useTable<Order>({
        columns,
        data,
        getRowId: (order) => order.id,
        enableRowSelection: (row) => !row.getIsGrouped(),
        enableMultiRowSelection: true,
        enableSorting: true,
        enableGrouping: true,
        enableExpanding: true,
        enableColumnPinning: true,
        // Keep the grouped "Статус" column where the user placed it instead of moving it first.
        groupedColumnMode: false,
        onRowSelectionChange: setRowSelection,
        onColumnOrderChange: setColumnOrder,
        onColumnPinningChange: setColumnPinning,
        onSortingChange: setSorting,
        onExpandedChange: setExpanded,
        state: {
            rowSelection,
            columnOrder,
            columnPinning,
            sorting,
            grouping,
            expanded,
        },
    });

    const handleColumnReorder = React.useCallback<
        NonNullable<ColumnReorderingProviderProps<Order>['onReorder']>
    >(({columnOrder: nextOrder, columnPinning: nextPinning, pinned}) => {
        if (pinned) {
            setColumnPinning(nextPinning);
        } else {
            setColumnOrder(nextOrder);
        }
    }, []);

    const handleRowClick = React.useCallback((row: Row<Order>) => {
        if (!row.getIsGrouped()) {
            row.toggleSelected();
        }
    }, []);

    const selectedOrders = table.getSelectedRowModel().flatRows.filter((row) => !row.getIsGrouped());
    const selectedTotal = selectedOrders.reduce((sum, row) => sum + row.original.total, 0);

    return (
        <Flex direction="column" gap={3} className="orders">
            <Flex className="orders__toolbar" alignItems="center" gap={4} wrap>
                <Switch
                    checked={groupByStatus}
                    onUpdate={(checked) => {
                        setGroupByStatus(checked);
                        setExpanded(true);
                    }}
                    content="Группировать по статусу"
                />
                <Button
                    view="flat-secondary"
                    size="m"
                    disabled={columnOrder.length === 0}
                    onClick={() => setColumnOrder([])}
                >
                    Сбросить порядок колонок
                </Button>
                <Flex className="orders__selection" alignItems="center" gap={2}>
                    {selectedOrders.length > 0 ? (
                        <React.Fragment>
                            <Text>
                                Выбрано: {pluralizeOrders(selectedOrders.length)} на{' '}
                                {formatMoney(selectedTotal)}
                            </Text>
                            <Button view="outlined" size="m" onClick={() => setRowSelection({})}>
                                Снять выделение
                            </Button>
                        </React.Fragment>
                    ) : (
                        <Text color="secondary">
                            Всего {pluralizeOrders(ORDERS.length)} · колонки можно перетаскивать за
                            заголовок
                        </Text>
                    )}
                </Flex>
            </Flex>

            <div className="orders__table-scroll">
                <ColumnReorderingProvider table={table} onReorder={handleColumnReorder}>
                    <Table
                        table={table}
                        size="m"
                        stickyHeader
                        verticalAlign="middle"
                        className="orders__table"
                        onRowClick={handleRowClick}
                        getIsGroupHeaderRow={getIsGroupHeaderRow}
                        renderGroupHeader={renderGroupHeader}
                        emptyContent={<Text color="secondary">Заказов пока нет</Text>}
                    />
                </ColumnReorderingProvider>
            </div>
        </Flex>
    );
}
