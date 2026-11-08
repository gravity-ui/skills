import {useState} from 'react';
import type {CSSProperties} from 'react';
import {ColumnReorderingProvider, Table, selectionColumn, useTable} from '@gravity-ui/table';
import type {ColumnDef, ExpandedState, Row, RowSelectionState} from '@gravity-ui/table/tanstack';
import {Label, Text} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

type OrderStatus = 'new' | 'processing' | 'delivered' | 'cancelled';

interface Order {
    id: string;
    customer: string;
    createdAt: string;
    total: number;
    status: OrderStatus;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
    new: 'Новый',
    processing: 'В обработке',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
};

const STATUS_THEMES: Record<OrderStatus, LabelProps['theme']> = {
    new: 'info',
    processing: 'warning',
    delivered: 'success',
    cancelled: 'danger',
};

const orders: Order[] = [
    {id: 'ORD-1001', customer: 'Иван Петров', createdAt: '2026-07-01', total: 12500, status: 'new'},
    {id: 'ORD-1002', customer: 'Мария Сидорова', createdAt: '2026-07-01', total: 4300, status: 'processing'},
    {id: 'ORD-1003', customer: 'Алексей Смирнов', createdAt: '2026-07-02', total: 78200, status: 'delivered'},
    {id: 'ORD-1004', customer: 'Ольга Кузнецова', createdAt: '2026-07-03', total: 2150, status: 'new'},
    {id: 'ORD-1005', customer: 'Дмитрий Волков', createdAt: '2026-07-03', total: 9990, status: 'cancelled'},
    {id: 'ORD-1006', customer: 'Елена Морозова', createdAt: '2026-07-04', total: 15600, status: 'processing'},
    {id: 'ORD-1007', customer: 'Сергей Павлов', createdAt: '2026-07-05', total: 33000, status: 'delivered'},
    {id: 'ORD-1008', customer: 'Анна Федорова', createdAt: '2026-07-06', total: 870, status: 'new'},
    {id: 'ORD-1009', customer: 'Павел Соколов', createdAt: '2026-07-07', total: 5400, status: 'delivered'},
    {id: 'ORD-1010', customer: 'Наталья Орлова', createdAt: '2026-07-08', total: 21700, status: 'cancelled'},
];

const columns: ColumnDef<Order>[] = [
    selectionColumn as ColumnDef<Order>,
    {accessorKey: 'id', header: '№ заказа', size: 120},
    {accessorKey: 'customer', header: 'Клиент', size: 220},
    {accessorKey: 'createdAt', header: 'Дата', size: 130},
    {
        accessorKey: 'total',
        header: 'Сумма',
        size: 120,
        cell: ({getValue}) => `${getValue<number>().toLocaleString('ru-RU')} ₽`,
    },
    {
        accessorKey: 'status',
        header: 'Статус',
        size: 150,
        cell: ({getValue}) => {
            const status = getValue<OrderStatus>();
            return <Label theme={STATUS_THEMES[status]}>{STATUS_LABELS[status]}</Label>;
        },
    },
];

const getIsGroupHeaderRow = (row: Row<Order>) => row.getIsGrouped();
const getGroupTitle = (row: Row<Order>) => STATUS_LABELS[row.getValue<OrderStatus>('status')];

const pageStyle: CSSProperties = {padding: 24, display: 'flex', flexDirection: 'column', gap: 16};

export function OrdersPage() {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>(true);

    const table = useTable({
        columns,
        data: orders,
        getRowId: (order) => order.id,
        enableRowSelection: true,
        enableMultiRowSelection: true,
        enableGrouping: true,
        enableExpanding: true,
        groupedColumnMode: false,
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        initialState: {grouping: ['status']},
        state: {rowSelection, expanded},
    });

    return (
        <div style={pageStyle}>
            <Text variant="header-1">Заказы</Text>
            <ColumnReorderingProvider table={table}>
                <Table
                    table={table}
                    getIsGroupHeaderRow={getIsGroupHeaderRow}
                    getGroupTitle={getGroupTitle}
                />
            </ColumnReorderingProvider>
        </div>
    );
}
