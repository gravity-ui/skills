import * as React from 'react';

import {Magnifier, ChevronDown, ChevronRight} from '@gravity-ui/icons';
import {
    ColumnReorderingProvider,
    Table,
    selectionColumn,
    useRowSelectionFixedHandler,
    useRowVirtualizer,
    useTable,
} from '@gravity-ui/table';
import type {BaseTableProps, ColumnDef, ColumnReorderingProviderProps} from '@gravity-ui/table';
import type {
    ColumnPinningState,
    ExpandedState,
    Row,
    RowSelectionState,
    SortingState,
} from '@gravity-ui/table/tanstack';
import {Button, Checkbox, Flex, Icon, Label, Switch, Text, TextInput} from '@gravity-ui/uikit';

import {
    STATUS_META,
    currencyFormatter,
    dateFormatter,
    generateOrders,
    groupByStatus,
} from './data';
import type {Order, OrderRow} from './data';

const ALL_ORDERS = generateOrders(500);

const SELECTION_COLUMN_ID = '_select';

const getRowId = (row: OrderRow) => row.id;
const getSubRows = (row: OrderRow) => (row.kind === 'group' ? row.items : undefined);
const isOrder = (row: OrderRow): row is Order => row.kind === 'order';

/** Reads a field of an order; group rows have no cell values. */
const orderValue =
    <K extends keyof Order>(key: K) =>
    (row: OrderRow) =>
        isOrder(row) ? row[key] : undefined;

const columns: ColumnDef<OrderRow>[] = [
    {
        ...(selectionColumn as ColumnDef<OrderRow>),
        enableColumnReordering: false,
    },
    {
        id: 'number',
        header: '№ заказа',
        accessorFn: orderValue('number'),
        size: 120,
        cell: ({getValue}) => <Text variant="code-1">{getValue<string>()}</Text>,
    },
    {
        id: 'createdAt',
        header: 'Дата',
        accessorFn: orderValue('createdAt'),
        size: 120,
        cell: ({getValue}) => dateFormatter.format(getValue<number>()),
    },
    {
        id: 'customer',
        header: 'Клиент',
        accessorFn: orderValue('customer'),
        size: 240,
        cell: ({getValue}) => (
            <Text ellipsis title={getValue<string>()}>
                {getValue<string>()}
            </Text>
        ),
    },
    {
        id: 'city',
        header: 'Город',
        accessorFn: orderValue('city'),
        size: 170,
    },
    {
        id: 'status',
        header: 'Статус',
        accessorFn: orderValue('status'),
        size: 150,
        cell: ({row}) => {
            const order = row.original;
            if (!isOrder(order)) return null;
            const meta = STATUS_META[order.status];
            return <Label theme={meta.theme}>{meta.title}</Label>;
        },
    },
    {
        id: 'itemsCount',
        header: 'Позиций',
        accessorFn: orderValue('itemsCount'),
        size: 100,
    },
    {
        id: 'amount',
        header: 'Сумма',
        accessorFn: orderValue('amount'),
        size: 140,
        cell: ({getValue}) => currencyFormatter.format(getValue<number>()),
    },
    {
        id: 'payment',
        header: 'Оплата',
        accessorFn: orderValue('payment'),
        size: 120,
    },
    {
        id: 'manager',
        header: 'Менеджер',
        accessorFn: orderValue('manager'),
        size: 150,
    },
];

function getRowClassName(row?: Row<OrderRow>) {
    if (!row) return '';
    if (row.original.kind === 'group') return 'orders-table__group-row';
    return row.getIsSelected()
        ? 'orders-table__row orders-table__row_selected'
        : 'orders-table__row';
}

/** Pinned (sticky) cells need an opaque background so scrolled cells don't show through. */
function getPinnedClassName(item?: {column: {getIsPinned: () => false | 'left' | 'right'}}) {
    return item?.column.getIsPinned() ? 'orders-table__pinned-cell' : '';
}

/** Adds group ids to the selection when every order of the group is selected. */
function withGroupSelection(leafSelection: RowSelectionState, data: OrderRow[]): RowSelectionState {
    const result: RowSelectionState = {...leafSelection};
    data.forEach((row) => {
        if (row.kind === 'group' && row.items.every((order) => leafSelection[order.id])) {
            result[row.id] = true;
        }
    });
    return result;
}

function onlyOrders(selection: RowSelectionState, visibleIds: Set<string>): RowSelectionState {
    const result: RowSelectionState = {};
    Object.keys(selection).forEach((id) => {
        if (selection[id] && visibleIds.has(id)) result[id] = true;
    });
    return result;
}

export function OrdersTable() {
    const [query, setQuery] = React.useState('');
    const [grouped, setGrouped] = React.useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
        left: [SELECTION_COLUMN_ID],
    });
    // Only order ids are stored; group ids are derived from them.
    const [leafSelection, setLeafSelection] = React.useState<RowSelectionState>({});

    const filteredOrders = React.useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return ALL_ORDERS;
        return ALL_ORDERS.filter((order) =>
            [order.number, order.customer, order.city, order.manager].some((value) =>
                value.toLowerCase().includes(normalized),
            ),
        );
    }, [query]);

    const visibleIds = React.useMemo(
        () => new Set(filteredOrders.map((order) => order.id)),
        [filteredOrders],
    );

    // Orders hidden by the search are deselected, so bulk actions never touch invisible rows.
    React.useEffect(() => {
        setLeafSelection((prev) => onlyOrders(prev, visibleIds));
    }, [visibleIds]);

    const data = React.useMemo<OrderRow[]>(
        () => (grouped ? groupByStatus(filteredOrders) : filteredOrders),
        [grouped, filteredOrders],
    );

    const rowSelection = React.useMemo(
        () => withGroupSelection(onlyOrders(leafSelection, visibleIds), data),
        [leafSelection, visibleIds, data],
    );

    const setRowSelection = React.useCallback<React.Dispatch<React.SetStateAction<RowSelectionState>>>(
        (next) => {
            setLeafSelection((prev) => {
                const value = typeof next === 'function' ? next(prev) : next;
                return onlyOrders(value, visibleIds);
            });
        },
        [visibleIds],
    );

    // Keeps group checkboxes consistent with their children (see TanStack/table#4878).
    const handleRowSelectionChange = useRowSelectionFixedHandler<OrderRow>({
        rowSelection,
        setRowSelection,
        tableData: data,
        getSubRows,
        getRowId,
    });

    const table = useTable<OrderRow>({
        columns,
        data,
        getRowId,
        getSubRows,
        enableExpanding: grouped,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableSorting: true,
        enableColumnPinning: true,
        onRowSelectionChange: handleRowSelectionChange,
        onSortingChange: setSorting,
        onExpandedChange: setExpanded,
        onColumnOrderChange: setColumnOrder,
        onColumnPinningChange: setColumnPinning,
        state: {
            rowSelection,
            sorting,
            expanded,
            columnOrder,
            columnPinning,
        },
    });

    const handleColumnReorder = React.useCallback<
        NonNullable<ColumnReorderingProviderProps<OrderRow>['onReorder']>
    >(({columnOrder: nextOrder, columnPinning: nextPinning, pinned}) => {
        if (pinned) {
            setColumnPinning(nextPinning);
        } else {
            setColumnOrder(nextOrder);
        }
    }, []);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const rows = table.getRowModel().rows;
    const getItemKey = React.useCallback(
        (index: number) => rows[index]?.id ?? `missing:${index}`,
        [rows],
    );
    const rowVirtualizer = useRowVirtualizer({
        count: rows.length,
        estimateSize: () => 42,
        overscan: 10,
        getItemKey,
        getScrollElement: () => containerRef.current,
    });

    const selectedCount = Object.keys(leafSelection).length;

    const handleGroupedChange = (value: boolean) => {
        setGrouped(value);
        setExpanded(true);
    };

    const handleRowClick = (row: Row<OrderRow>, event: React.MouseEvent<HTMLTableRowElement>) => {
        if (!isOrder(row.original)) return;
        // Clicks on the checkbox are already handled by the checkbox itself.
        if ((event.target as HTMLElement).closest('label, input, button, a')) return;
        row.toggleSelected();
    };

    const renderGroupHeaderRowContent = React.useCallback<
        NonNullable<BaseTableProps<OrderRow>['renderGroupHeaderRowContent']>
    >(({row, Cell, cellClassName}) => {
        const group = row.original;
        if (group.kind !== 'group') return null;
        const meta = STATUS_META[group.status];
        const isExpanded = row.getIsExpanded();

        return (
            <Cell className={cellClassName} colSpan={row.getVisibleCells().length}>
                <Flex alignItems="center" gap={3}>
                    <Checkbox
                        size="m"
                        checked={row.getIsAllSubRowsSelected()}
                        indeterminate={row.getIsSomeSelected() && !row.getIsAllSubRowsSelected()}
                        onUpdate={(checked) => row.toggleSelected(checked)}
                        title={`Выбрать все заказы со статусом «${meta.title}»`}
                    />
                    <Button
                        view="flat"
                        size="s"
                        onClick={row.getToggleExpandedHandler()}
                        aria-expanded={isExpanded}
                    >
                        <Icon data={isExpanded ? ChevronDown : ChevronRight} size={16} />
                        <Label theme={meta.theme}>{meta.title}</Label>
                    </Button>
                    <Text color="secondary">
                        {group.items.length} шт. · {currencyFormatter.format(group.total)}
                    </Text>
                </Flex>
            </Cell>
        );
    }, []);

    return (
        <Flex direction="column" gap={4} className="orders">
            <Flex alignItems="center" gap={4} wrap="wrap" className="orders__toolbar">
                <TextInput
                    className="orders__search"
                    placeholder="Поиск по номеру, клиенту, городу, менеджеру"
                    value={query}
                    onUpdate={setQuery}
                    hasClear
                    startContent={<Icon data={Magnifier} size={16} className="orders__search-icon" />}
                />
                <Switch checked={grouped} onUpdate={handleGroupedChange} content="Группировать по статусу" />
                <Flex alignItems="center" gap={2} className="orders__selection">
                    <Text color="secondary">
                        {selectedCount > 0
                            ? `Выбрано: ${selectedCount} из ${filteredOrders.length}`
                            : `Заказов: ${filteredOrders.length}`}
                    </Text>
                    {selectedCount > 0 && (
                        <Button view="flat" size="m" onClick={() => setLeafSelection({})}>
                            Снять выделение
                        </Button>
                    )}
                </Flex>
            </Flex>

            <div ref={containerRef} className="orders__table-container">
                <ColumnReorderingProvider
                    table={table}
                    onReorder={handleColumnReorder}
                    dragOverlayRowCount={8}
                >
                    <Table
                        table={table}
                        className="orders-table"
                        size="m"
                        stickyHeader
                        rowVirtualizer={rowVirtualizer}
                        getIsGroupHeaderRow={(row) => row.original.kind === 'group'}
                        renderGroupHeaderRowContent={renderGroupHeaderRowContent}
                        rowClassName={getRowClassName}
                        cellClassName={getPinnedClassName}
                        headerCellClassName={getPinnedClassName}
                        onRowClick={handleRowClick}
                        emptyContent={
                            <Flex direction="column" alignItems="center" gap={1} className="orders__empty">
                                <Text variant="subheader-2">Ничего не найдено</Text>
                                <Text color="secondary">Измените условия поиска</Text>
                            </Flex>
                        }
                    />
                </ColumnReorderingProvider>
            </div>
        </Flex>
    );
}
