import React from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {House, Persons, ShoppingCart, Gear} from '@gravity-ui/icons';
import {
    Table,
    useTable,
    ColumnReorderingProvider,
    selectionColumn,
    TreeExpandableCell,
    useRowSelectionFixedHandler,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Text, Box} from '@gravity-ui/uikit';

interface Order {
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    date: string;
}

interface OrderGroup {
    id: string;
    status: string;
    items: Order[];
}

type OrderItem = OrderGroup | Order;

const orders: Order[] = [
    {id: '1', customer: 'Иван Петров', product: 'Ноутбук Pro', amount: 120000, status: 'Новый', date: '2026-11-01'},
    {id: '2', customer: 'Анна Смирнова', product: 'Монитор 27"', amount: 45000, status: 'Новый', date: '2026-11-02'},
    {id: '3', customer: 'Олег Иванов', product: 'Клавиатура', amount: 8000, status: 'В обработке', date: '2026-10-30'},
    {id: '4', customer: 'Мария Козлова', product: 'Мышь', amount: 3500, status: 'В обработке', date: '2026-10-29'},
    {id: '5', customer: 'Дмитрий Соколов', product: 'Наушники', amount: 12000, status: 'В обработке', date: '2026-10-28'},
    {id: '6', customer: 'Елена Волкова', product: 'Планшет', amount: 65000, status: 'Доставка', date: '2026-10-25'},
    {id: '7', customer: 'Сергей Морозов', product: 'Телефон', amount: 89000, status: 'Доставка', date: '2026-10-24'},
    {id: '8', customer: 'Наталья Белова', product: 'Чехол', amount: 1500, status: 'Завершён', date: '2026-10-20'},
    {id: '9', customer: 'Алексей Зайцев', product: 'Зарядка', amount: 2500, status: 'Завершён', date: '2026-10-18'},
    {id: '10', customer: 'Татьяна Орлова', product: 'Кабель USB-C', amount: 1200, status: 'Завершён', date: '2026-10-15'},
    {id: '11', customer: 'Павел Кузнецов', product: 'Роутер', amount: 7800, status: 'Отменён', date: '2026-10-12'},
    {id: '12', customer: 'Виктория Фёдорова', product: 'Веб-камера', amount: 9500, status: 'Отменён', date: '2026-10-10'},
];

const statusOrder = ['Новый', 'В обработке', 'Доставка', 'Завершён', 'Отменён'];

function buildGroupedData(source: Order[]): OrderGroup[] {
    const groups = new Map<string, Order[]>();
    for (const order of source) {
        const list = groups.get(order.status) ?? [];
        list.push(order);
        groups.set(order.status, list);
    }
    return statusOrder
        .filter((status) => groups.has(status))
        .map((status) => ({id: status, status, items: groups.get(status)!}));
}

const getRowId = (item: OrderItem) => item.id;
const getSubRows = (item: OrderItem): OrderItem[] | undefined =>
    'items' in item ? item.items : undefined;

const columns: ColumnDef<OrderItem>[] = [
    selectionColumn as ColumnDef<OrderItem>,
    {
        accessorKey: 'customer',
        header: 'Клиент',
        size: 180,
        withNestingStyles: true,
        cell: ({row, getValue}: {row: Row<OrderItem>; getValue: () => unknown}) => {
            if (row.getCanExpand()) {
                return <TreeExpandableCell row={row}>{getValue() as string}</TreeExpandableCell>;
            }
            return getValue() as string;
        },
    },
    {accessorKey: 'product', header: 'Товар', size: 180},
    {
        accessorKey: 'amount',
        header: 'Сумма',
        size: 120,
        cell: ({getValue}: {getValue: () => unknown}) => {
            const val = getValue() as number | undefined;
            if (val === undefined) return null;
            return `${val.toLocaleString('ru-RU')} ₽`;
        },
    },
    {accessorKey: 'status', header: 'Статус', size: 140},
    {accessorKey: 'date', header: 'Дата', size: 130},
];

const getGroupTitle = (row: Row<OrderItem>) => row.getValue<string>('status');

export function App() {
    'use no memo';

    const [compact, setCompact] = React.useState(false);
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const [columnOrder, setColumnOrder] = React.useState<string[]>([]);

    const groupedData = React.useMemo(() => buildGroupedData(orders), []);

    const handleRowSelectionChange = useRowSelectionFixedHandler<OrderItem>({
        rowSelection,
        setRowSelection,
        tableData: groupedData,
        getSubRows,
        getRowId,
    });

    const table = useTable({
        columns,
        data: groupedData,
        getRowId,
        getSubRows,
        enableExpanding: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onRowSelectionChange: handleRowSelectionChange,
        state: {
            rowSelection,
            columnOrder,
        },
        onColumnOrderChange: setColumnOrder,
    });

    const handleColumnReorder = React.useCallback(
        ({columnOrder: newOrder}: {columnOrder: string[]}) => {
            setColumnOrder(newOrder);
        },
        [],
    );

    return (
        <AsideHeader
            logo={{text: 'Админка', href: '/'}}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={[
                {id: 'home', title: 'Главная', icon: House, current: false},
                {id: 'users', title: 'Пользователи', icon: Persons},
                {id: 'orders', title: 'Заказы', icon: ShoppingCart, current: true},
                {id: 'settings', title: 'Настройки', icon: Gear},
            ]}
            renderContent={() => (
                <Box spacing={{p: 6}}>
                    <Text variant="header-1">Заказы</Text>
                    <Box spacing={{mt: 4}}>
                        <ColumnReorderingProvider table={table} onReorder={handleColumnReorder}>
                            <Table table={table} getGroupTitle={getGroupTitle} />
                        </ColumnReorderingProvider>
                    </Box>
                </Box>
            )}
        />
    );
}
