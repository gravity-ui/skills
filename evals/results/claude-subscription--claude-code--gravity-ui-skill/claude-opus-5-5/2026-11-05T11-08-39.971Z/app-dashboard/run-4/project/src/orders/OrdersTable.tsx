import * as React from 'react';

import {
    ColumnReorderingProvider,
    Table,
    selectionColumn,
    useRowSelectionFixedHandler,
    useRowVirtualizer,
    useTable,
} from '@gravity-ui/table';
import type {
    BaseGroupHeaderProps,
    ColumnDef,
    ColumnReorderingProviderProps,
} from '@gravity-ui/table';
import type {
    Cell,
    ColumnPinningState,
    Header,
    ExpandedState,
    Row,
    RowSelectionState,
    SortingState,
} from '@gravity-ui/table/tanstack';
import {ArrowToggle, Button, Checkbox, Flex, Label, Switch, Text} from '@gravity-ui/uikit';

import {
    STATUS_META,
    formatDate,
    formatMoney,
    generateOrders,
    groupOrdersByStatus,
    isGroupRowId,
    isOrderGroup,
} from './data';
import type {Order, OrderRow} from './data';

import './OrdersTable.css';

const ORDERS = generateOrders(1000);
const GROUPED_ORDERS = groupOrdersByStatus(ORDERS);

const SELECT_COLUMN_ID = '_select';
const COLUMN_PINNING: ColumnPinningState = {left: [SELECT_COLUMN_ID], right: []};

const getRowId = (item: OrderRow) => item.id;
const getSubRows = (item: OrderRow) => (isOrderGroup(item) ? item.items : undefined);

/** Значение колонки для строки-заказа; у строк-групп значения нет (сортировка не трогает порядок групп). */
const orderValue =
    <T,>(get: (order: Order) => T) =>
    (item: OrderRow): T | undefined =>
        isOrderGroup(item) ? undefined : get(item);

const asOrder = (row: Row<OrderRow>) => row.original as Order;

const dataColumns: ColumnDef<OrderRow>[] = [
    {
        id: 'number',
        header: '№ заказа',
        accessorFn: orderValue((order) => order.number),
        size: 120,
        cell: ({row}) => <Text variant="body-1">{asOrder(row).number}</Text>,
    },
    {
        id: 'customer',
        header: 'Клиент',
        accessorFn: orderValue((order) => order.customer),
        size: 200,
    },
    {
        id: 'createdAt',
        header: 'Дата',
        accessorFn: orderValue((order) => order.createdAt.getTime()),
        size: 120,
        cell: ({row}) => formatDate(asOrder(row).createdAt),
    },
    {
        id: 'status',
        header: 'Статус',
        accessorFn: orderValue((order) => order.status),
        size: 150,
        cell: ({row}) => {
            const meta = STATUS_META[asOrder(row).status];
            return <Label theme={meta.theme}>{meta.title}</Label>;
        },
    },
    {
        id: 'itemsCount',
        header: 'Товаров',
        accessorFn: orderValue((order) => order.itemsCount),
        size: 100,
    },
    {
        id: 'amount',
        header: 'Сумма',
        accessorFn: orderValue((order) => order.amount),
        size: 140,
        cell: ({row}) => formatMoney(asOrder(row).amount),
    },
    {
        id: 'payment',
        header: 'Оплата',
        accessorFn: orderValue((order) => order.payment),
        size: 160,
    },
    {
        id: 'city',
        header: 'Город',
        accessorFn: orderValue((order) => order.city),
        size: 170,
    },
];

/**
 * С вложенными строками диапазонное выделение (Shift+клик) не поддерживается библиотекой,
 * поэтому в режиме группировки используется обычный чекбокс.
 */
const groupedSelectionColumn: ColumnDef<OrderRow> = {
    id: SELECT_COLUMN_ID,
    header: ({table}) => (
        <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            title="Выбрать все"
        />
    ),
    cell: ({row}) => (
        <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
        />
    ),
    size: 40,
    minSize: 40,
    enableSorting: false,
    enableColumnReordering: false,
};

const flatSelectionColumn: ColumnDef<OrderRow> = {
    ...(selectionColumn as ColumnDef<OrderRow>),
    id: SELECT_COLUMN_ID,
    size: 40,
    minSize: 40,
    enableSorting: false,
    enableColumnReordering: false,
};

const DEFAULT_COLUMN_ORDER = [SELECT_COLUMN_ID, ...dataColumns.map((column) => column.id as string)];

const getGroupTitle = (row: Row<OrderRow>) => {
    const item = row.original;
    return isOrderGroup(item) ? STATUS_META[item.status].title : row.id;
};

function GroupHeader({row}: BaseGroupHeaderProps<OrderRow>) {
    const group = row.original;
    if (!isOrderGroup(group)) {
        return null;
    }

    const meta = STATUS_META[group.status];
    const total = group.items.reduce((sum, order) => sum + order.amount, 0);
    const expanded = row.getIsExpanded();

    return (
        <Flex alignItems="center" gap={3} className="orders-table__group-header">
            <Checkbox
                className="orders-table__group-checkbox"
                checked={row.getIsSelected()}
                indeterminate={row.getIsSomeSelected()}
                onUpdate={(checked) => row.toggleSelected(checked)}
                title={`Выбрать все заказы со статусом «${meta.title}»`}
            />
            <Button
                view="flat"
                size="s"
                onClick={row.getToggleExpandedHandler()}
                aria-expanded={expanded}
                title={expanded ? 'Свернуть группу' : 'Развернуть группу'}
            >
                <Button.Icon>
                    <ArrowToggle direction={expanded ? 'bottom' : 'right'} size={14} />
                </Button.Icon>
            </Button>
            <Label theme={meta.theme} size="s">
                {meta.title}
            </Label>
            <Text color="secondary">
                {group.items.length} шт. · {formatMoney(total)}
            </Text>
        </Flex>
    );
}

/** Закреплённым ячейкам нужен непрозрачный фон, иначе при горизонтальной прокрутке под ними видны соседние колонки. */
const getCellClassName = (cell?: Cell<OrderRow, unknown>) => {
    if (!cell) {
        return '';
    }
    const classes = [];
    if (cell.column.getIsPinned()) {
        classes.push('orders-table__cell_pinned');
    }
    if (cell.row.getIsSelected() && !isOrderGroup(cell.row.original)) {
        classes.push('orders-table__cell_selected');
    }
    return classes.join(' ');
};

const getHeaderCellClassName = (header: Header<OrderRow, unknown>) =>
    header.column.getIsPinned() ? 'orders-table__cell_pinned' : '';

const renderGroupHeader = (props: BaseGroupHeaderProps<OrderRow>) => <GroupHeader {...props} />;

export function OrdersTable() {
    const [grouped, setGrouped] = React.useState(true);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [expanded, setExpanded] = React.useState<ExpandedState>(true);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnOrder, setColumnOrder] = React.useState<string[]>(DEFAULT_COLUMN_ORDER);

    const data: OrderRow[] = grouped ? GROUPED_ORDERS : ORDERS;
    const columns = React.useMemo(
        () => [grouped ? groupedSelectionColumn : flatSelectionColumn, ...dataColumns],
        [grouped],
    );

    // Без этого обработчика чекбокс группы показывает неверное состояние (TanStack/table#4878).
    const handleRowSelectionChange = useRowSelectionFixedHandler({
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
        getSubRows: grouped ? getSubRows : undefined,
        enableExpanding: grouped,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableSubRowSelection: true,
        enableSorting: true,
        enableColumnPinning: true,
        onRowSelectionChange: handleRowSelectionChange,
        onExpandedChange: setExpanded,
        onSortingChange: setSorting,
        onColumnOrderChange: setColumnOrder,
        state: {
            rowSelection,
            expanded,
            sorting,
            columnOrder,
            columnPinning: COLUMN_PINNING,
        },
    });

    const handleColumnReorder = React.useCallback<
        NonNullable<ColumnReorderingProviderProps<OrderRow>['onReorder']>
    >(({columnOrder: nextOrder}) => setColumnOrder(nextOrder), []);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const rows = table.getRowModel().rows;
    const rowVirtualizer = useRowVirtualizer({
        count: rows.length,
        estimateSize: () => 42,
        overscan: 10,
        getScrollElement: () => containerRef.current,
        getItemKey: (index) => rows[index]?.id ?? index,
    });

    const handleGroupedChange = (checked: boolean) => {
        setGrouped(checked);
        // Ключи групп существуют только в режиме группировки.
        setRowSelection((current) =>
            Object.fromEntries(Object.entries(current).filter(([id]) => !isGroupRowId(id))),
        );
        setExpanded(true);
    };

    const selectedCount = Object.keys(rowSelection).filter(
        (id) => rowSelection[id] && !isGroupRowId(id),
    ).length;
    const isDefaultOrder = columnOrder.join() === DEFAULT_COLUMN_ORDER.join();

    return (
        <Flex direction="column" gap={4} className="orders-table">
            <Flex alignItems="center" gap={4} wrap className="orders-table__toolbar">
                <Flex direction="column" className="orders-table__title">
                    <Text variant="header-1">Заказы</Text>
                    <Text color="secondary">
                        Всего {ORDERS.length}
                        {selectedCount > 0 ? ` · выбрано ${selectedCount}` : ''}
                    </Text>
                </Flex>
                <Switch
                    checked={grouped}
                    onUpdate={handleGroupedChange}
                    content="Группировать по статусу"
                />
                {selectedCount > 0 && (
                    <Button view="outlined" onClick={() => setRowSelection({})}>
                        Снять выделение
                    </Button>
                )}
                <Button
                    view="flat"
                    disabled={isDefaultOrder}
                    onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}
                >
                    Сбросить порядок колонок
                </Button>
            </Flex>
            <Text color="secondary" variant="caption-2">
                Перетащите заголовок колонки, чтобы поменять колонки местами. Клик по заголовку —
                сортировка{grouped ? '' : ', Shift+клик по чекбоксу — выделение диапазона'}.
            </Text>
            <div ref={containerRef} className="orders-table__scroll">
                <ColumnReorderingProvider table={table} onReorder={handleColumnReorder}>
                    <Table
                        table={table}
                        rowVirtualizer={rowVirtualizer}
                        stickyHeader
                        getIsGroupHeaderRow={(row) => isOrderGroup(row.original)}
                        getGroupTitle={getGroupTitle}
                        renderGroupHeader={renderGroupHeader}
                        cellClassName={getCellClassName}
                        headerCellClassName={getHeaderCellClassName}
                        emptyContent={<Text color="secondary">Заказов нет</Text>}
                    />
                </ColumnReorderingProvider>
            </div>
        </Flex>
    );
}
