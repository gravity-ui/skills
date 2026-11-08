import React from 'react';

import {AsideHeader} from '@gravity-ui/navigation';
import {
    ColumnReorderingProvider,
    Table,
    TreeExpandableCell,
    selectionColumn,
    useTable,
} from '@gravity-ui/table';
import type {ColumnDef} from '@gravity-ui/table';
import type {ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Gear, House, Person, ShoppingCart} from '@gravity-ui/icons';

type OrderStatus = 'Новый' | 'В обработке' | 'Отправлен' | 'Доставлен';

interface Order {
    id: string;
    customer: string;
    product: string;
    amount: number;
    date: string;
    status: OrderStatus;
}

interface OrderGroup {
    id: string;
    status: OrderStatus;
    items: Order[];
}

type TableRow = OrderGroup | Order;

const statuses: OrderStatus[] = ['Новый', 'В обработке', 'Отправлен', 'Доставлен'];

const orders: Order[] = [
    {id: 'ORD-001', customer: 'Иванов И.И.', product: 'Ноутбук Pro', amount: 156000, date: '2026-11-01', status: 'Новый'},
    {id: 'ORD-002', customer: 'Петров П.П.', product: 'Монитор 27"', amount: 42000, date: '2026-11-02', status: 'Новый'},
    {id: 'ORD-003', customer: 'Сидоров С.С.', product: 'Клавиатура MX', amount: 14500, date: '2026-10-28', status: 'В обработке'},
    {id: 'ORD-004', customer: 'Козлова А.В.', product: 'Мышь Ergo', amount: 8900, date: '2026-10-27', status: 'В обработке'},
    {id: 'ORD-005', customer: 'Морозов Д.Е.', product: 'SSD 1TB', amount: 11200, date: '2026-10-25', status: 'В обработке'},
    {id: 'ORD-006', customer: 'Волкова Е.Н.', product: 'Принтер Лазер', amount: 27800, date: '2026-10-20', status: 'Отправлен'},
    {id: 'ORD-007', customer: 'Зайцев Р.Г.', product: 'USB-хаб 7 портов', amount: 3200, date: '2026-10-18', status: 'Отправлен'},
    {id: 'ORD-008', customer: 'Фёдорова О.К.', product: 'Наушники ANC', amount: 18900, date: '2026-10-15', status: 'Доставлен'},
    {id: 'ORD-009', customer: 'Григорьев М.Л.', product: 'Веб-камера 4K', amount: 23400, date: '2026-10-12', status: 'Доставлен'},
    {id: 'ORD-010', customer: 'Белова Т.С.', product: 'Планшет Lite', amount: 47500, date: '2026-10-10', status: 'Доставлен'},
];

const groupedData: OrderGroup[] = statuses.map((status) => ({
    id: `grp-${status}`,
    status,
    items: orders.filter((order) => order.status === status),
}));

const orderColumns: ColumnDef<TableRow>[] = [
    selectionColumn as ColumnDef<TableRow>,
    {
        accessorKey: 'id',
        header: '№ заказа',
        size: 130,
        withNestingStyles: true,
        showTreeDepthIndicators: false,
        cell: ({row, getValue}) => {
            if ('items' in row.original) {
                return <span style={{fontWeight: 600}}>{getValue<string>()}</span>;
            }
            return <TreeExpandableCell row={row}>{getValue<string>()}</TreeExpandableCell>;
        },
    },
    {accessorKey: 'customer', header: 'Клиент', size: 180},
    {accessorKey: 'product', header: 'Товар', size: 200},
    {accessorKey: 'amount', header: 'Сумма, ₽', size: 120},
    {accessorKey: 'date', header: 'Дата', size: 130},
    {accessorKey: 'status', header: 'Статус', size: 150},
];

function getGroupTitle(row: Row<TableRow>): string {
    if ('items' in row.original) {
        return `Статус: ${row.original.status}`;
    }
    return '';
}

function OrdersTable() {
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const table = useTable({
        columns: orderColumns,
        data: groupedData,
        getRowId: (item) => item.id,
        getSubRows: (item) => ('items' in item ? item.items : undefined),
        enableExpanding: true,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        onExpandedChange: setExpanded,
        onRowSelectionChange: setRowSelection,
        state: {
            expanded,
            rowSelection,
        },
    });

    return (
        <ColumnReorderingProvider table={table}>
            <Table table={table} getGroupTitle={getGroupTitle} />
        </ColumnReorderingProvider>
    );
}

export function App() {
    const [compact, setCompact] = React.useState(false);

    return (
        <AsideHeader
            logo={{
                text: 'Админ-панель',
                icon: ShoppingCart,
                href: '/',
            }}
            compact={compact}
            onChangeCompact={setCompact}
            menuItems={[
                {id: 'home', title: 'Главная', icon: House},
                {id: 'users', title: 'Пользователи', icon: Person},
                {id: 'orders', title: 'Заказы', icon: ShoppingCart, current: true},
                {id: 'settings', title: 'Настройки', icon: Gear},
            ]}
            renderContent={() => (
                <main style={{padding: 24, height: '100%', overflow: 'auto'}}>
                    <h1 style={{marginBottom: 24, fontSize: 24, fontWeight: 600}}>Заказы</h1>
                    <OrdersTable />
                </main>
            )}
        />
    );
}
