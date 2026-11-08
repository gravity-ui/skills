import { ArrowRotateLeft } from '@gravity-ui/icons';
import type { ActionsPanelProps } from '@gravity-ui/uikit';
import { ActionsPanel, Button, Icon, Switch, Text } from '@gravity-ui/uikit';
import { useCallback, useMemo, useState } from 'react';

import { usePersistentState } from '../usePersistentState';
import { STATUS_META, STATUS_ORDER, type Order, type OrderStatus } from './data';
import { buildRows, sanitizeOrder } from './logic';
import { DEFAULT_COLUMN_ORDER, OrdersTable, pluralOrders, type ColumnId } from './OrdersTable';

const BULK_STATUSES: OrderStatus[] = ['processing', 'shipped', 'delivered', 'cancelled'];

const parseColumnOrder = (raw: unknown) => sanitizeOrder(raw, DEFAULT_COLUMN_ORDER);
const parseCollapsed = (raw: unknown) =>
    Array.isArray(raw) ? raw.filter((s): s is OrderStatus => STATUS_ORDER.includes(s)) : [];

interface OrdersPageProps {
    orders: Order[];
    onOrdersChange: (orders: Order[]) => void;
}

export function OrdersPage({ orders, onOrdersChange }: OrdersPageProps) {
    const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
    const [grouped, setGrouped] = usePersistentState('orders.grouped', true, (raw) => raw !== false);
    const [collapsedList, setCollapsedList] = usePersistentState<OrderStatus[]>('orders.collapsed', [], parseCollapsed);
    const [columnOrder, setColumnOrder] = usePersistentState<ColumnId[]>(
        'orders.columns',
        DEFAULT_COLUMN_ORDER,
        parseColumnOrder,
    );
    const [announcement, setAnnouncement] = useState('');

    const collapsed = useMemo(() => new Set(collapsedList), [collapsedList]);
    const rows = useMemo(() => buildRows(orders, grouped, collapsed), [orders, grouped, collapsed]);
    const isDefaultOrder = columnOrder.every((id, i) => id === DEFAULT_COLUMN_ORDER[i]);

    const toggleGroup = useCallback(
        (status: OrderStatus) =>
            setCollapsedList((list) => (list.includes(status) ? list.filter((s) => s !== status) : [...list, status])),
        [setCollapsedList],
    );

    const applyStatus = (status: OrderStatus) => {
        const count = selected.size;
        onOrdersChange(orders.map((o) => (selected.has(o.id) ? { ...o, status } : o)));
        setSelected(new Set());
        setAnnouncement(`Статус ${pluralOrders(count)} изменён на «${STATUS_META[status].label}»`);
    };

    const actions: ActionsPanelProps['actions'] = BULK_STATUSES.map((status) => {
        const text = status === 'cancelled' ? 'Отменить' : `→ ${STATUS_META[status].label}`;
        return {
            id: status,
            button: { props: { children: text, onClick: () => applyStatus(status) } },
            dropdown: { item: { text, action: () => applyStatus(status) } },
        };
    });

    return (
        <section className="page">
            <header className="page__header">
                <div>
                    <Text as="h1" variant="header-1">
                        Заказы
                    </Text>
                    <Text color="secondary">
                        {pluralOrders(orders.length)} · перетащите заголовок колонки, чтобы поменять колонки местами
                    </Text>
                </div>
                <div className="page__toolbar">
                    {!isDefaultOrder && (
                        <Button view="flat" onClick={() => setColumnOrder(DEFAULT_COLUMN_ORDER)}>
                            <Icon data={ArrowRotateLeft} size={16} />
                            Вернуть порядок колонок
                        </Button>
                    )}
                    <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
                </div>
            </header>

            <div className="page__table">
                <OrdersTable
                    orders={orders}
                    rows={rows}
                    columnOrder={columnOrder}
                    onColumnOrderChange={setColumnOrder}
                    selected={selected}
                    onSelectionChange={setSelected}
                    onToggleGroup={toggleGroup}
                    announce={setAnnouncement}
                />
            </div>

            {selected.size > 0 && (
                <ActionsPanel
                    className="page__actions"
                    actions={actions}
                    onClose={() => setSelected(new Set())}
                    renderNote={() => `Выбрано: ${pluralOrders(selected.size)}`}
                />
            )}

            <div className="visually-hidden" role="status" aria-live="polite">
                {announcement}
            </div>
        </section>
    );
}
