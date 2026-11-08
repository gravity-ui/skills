import React from 'react';
import {Button, Checkbox, Icon, Label, Switch, Text} from '@gravity-ui/uikit';
import {ArrowRotateLeft, ChevronDown, ChevronRight, Grip} from '@gravity-ui/icons';

import {
    ORDERS,
    STATUS_CONFIG,
    STATUS_ORDER,
    formatAmount,
    formatDate,
    type Order,
    type OrderStatus,
} from './ordersData';

interface ColumnDef {
    id: string;
    title: string;
    align?: 'left' | 'right' | 'center';
    width?: number;
    render: (order: Order) => React.ReactNode;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
    {id: 'number', title: '№ заказа', width: 110, render: (o) => <b>{o.number}</b>},
    {id: 'client', title: 'Клиент', render: (o) => o.client},
    {
        id: 'email',
        title: 'E-mail',
        render: (o) => (
            <Text color="secondary" variant="body-1">
                {o.email}
            </Text>
        ),
    },
    {id: 'city', title: 'Город', render: (o) => o.city},
    {id: 'date', title: 'Дата', width: 130, render: (o) => formatDate(o.date)},
    {
        id: 'items',
        title: 'Позиции',
        align: 'center',
        width: 90,
        render: (o) => o.items,
    },
    {id: 'payment', title: 'Оплата', width: 140, render: (o) => o.payment},
    {
        id: 'amount',
        title: 'Сумма',
        align: 'right',
        width: 130,
        render: (o) => <b>{formatAmount(o.amount)}</b>,
    },
    {
        id: 'status',
        title: 'Статус',
        width: 140,
        render: (o) => {
            const cfg = STATUS_CONFIG[o.status];
            return <Label theme={cfg.theme}>{cfg.title}</Label>;
        },
    },
];

const CHECKBOX_COL_WIDTH = 44;

export function OrdersTable() {
    const [columns, setColumns] = React.useState<ColumnDef[]>(DEFAULT_COLUMNS);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [grouped, setGrouped] = React.useState(false);
    const [collapsedGroups, setCollapsedGroups] = React.useState<Set<OrderStatus>>(new Set());
    const [dragColId, setDragColId] = React.useState<string | null>(null);
    const [dragOverColId, setDragOverColId] = React.useState<string | null>(null);

    const toggleRow = React.useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleMany = React.useCallback((ids: string[], checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            for (const id of ids) {
                if (checked) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
            }
            return next;
        });
    }, []);

    const allSelected = selectedIds.size === ORDERS.length && ORDERS.length > 0;
    const someSelected = selectedIds.size > 0 && !allSelected;

    const selectedTotal = React.useMemo(
        () =>
            ORDERS.filter((o) => selectedIds.has(o.id)).reduce((sum, o) => sum + o.amount, 0),
        [selectedIds],
    );

    // --- Column drag & drop ---
    const handleDragStart = (colId: string) => (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', colId);
        setDragColId(colId);
    };

    const handleDragOver = (colId: string) => (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragColId && colId !== dragColId && colId !== dragOverColId) {
            setDragOverColId(colId);
        }
    };

    const handleDrop = (targetId: string) => (e: React.DragEvent) => {
        e.preventDefault();
        const sourceId = dragColId ?? e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== targetId) {
            setColumns((prev) => {
                const from = prev.findIndex((c) => c.id === sourceId);
                const to = prev.findIndex((c) => c.id === targetId);
                if (from === -1 || to === -1) return prev;
                const next = [...prev];
                const [moved] = next.splice(from, 1);
                next.splice(to, 0, moved);
                return next;
            });
        }
        setDragColId(null);
        setDragOverColId(null);
    };

    const handleDragEnd = () => {
        setDragColId(null);
        setDragOverColId(null);
    };

    // --- Grouping ---
    const groups = React.useMemo(() => {
        if (!grouped) return null;
        return STATUS_ORDER.map((status) => ({
            status,
            orders: ORDERS.filter((o) => o.status === status),
        })).filter((g) => g.orders.length > 0);
    }, [grouped]);

    const toggleGroupCollapsed = (status: OrderStatus) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(status)) {
                next.delete(status);
            } else {
                next.add(status);
            }
            return next;
        });
    };

    const renderOrderRow = (order: Order) => {
        const selected = selectedIds.has(order.id);
        return (
            <tr
                key={order.id}
                className={`orders-table__row${selected ? ' orders-table__row_selected' : ''}`}
                onClick={() => toggleRow(order.id)}
            >
                <td
                    className="orders-table__cell orders-table__cell_checkbox"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={selected}
                        onChange={() => toggleRow(order.id)}
                        aria-label={`Выбрать заказ ${order.number}`}
                    />
                </td>
                {columns.map((col) => (
                    <td
                        key={col.id}
                        className="orders-table__cell"
                        style={{textAlign: col.align, width: col.width}}
                    >
                        {col.render(order)}
                    </td>
                ))}
            </tr>
        );
    };

    const renderGroup = (status: OrderStatus, orders: Order[]) => {
        const cfg = STATUS_CONFIG[status];
        const collapsed = collapsedGroups.has(status);
        const ids = orders.map((o) => o.id);
        const selectedCount = ids.filter((id) => selectedIds.has(id)).length;
        const groupSum = orders.reduce((sum, o) => sum + o.amount, 0);

        return (
            <React.Fragment key={status}>
                <tr className="orders-table__group-row">
                    <td colSpan={columns.length + 1}>
                        <div className="orders-table__group-header">
                            <button
                                type="button"
                                className="orders-table__group-toggle"
                                onClick={() => toggleGroupCollapsed(status)}
                                aria-expanded={!collapsed}
                                aria-label={
                                    collapsed ? `Развернуть «${cfg.title}»` : `Свернуть «${cfg.title}»`
                                }
                            >
                                <Icon data={collapsed ? ChevronRight : ChevronDown} size={16} />
                            </button>
                            <span onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={selectedCount === ids.length && ids.length > 0}
                                    indeterminate={selectedCount > 0 && selectedCount < ids.length}
                                    onChange={(e) => toggleMany(ids, e.target.checked)}
                                    aria-label={`Выбрать все заказы со статусом «${cfg.title}»`}
                                />
                            </span>
                            <Label theme={cfg.theme}>{cfg.title}</Label>
                            <Text variant="body-2" color="secondary">
                                {orders.length} {plural(orders.length)} · {formatAmount(groupSum)}
                            </Text>
                        </div>
                    </td>
                </tr>
                {!collapsed && orders.map(renderOrderRow)}
            </React.Fragment>
        );
    };

    return (
        <div className="orders-table">
            <div className="orders-table__toolbar">
                <div className="orders-table__toolbar-left">
                    <Text variant="subheader-2">Заказы</Text>
                    <Text variant="body-2" color="secondary">
                        {selectedIds.size > 0
                            ? `Выбрано: ${selectedIds.size} на сумму ${formatAmount(selectedTotal)}`
                            : `Всего: ${ORDERS.length}`}
                    </Text>
                    {selectedIds.size > 0 && (
                        <Button size="s" view="flat" onClick={() => setSelectedIds(new Set())}>
                            Снять выделение
                        </Button>
                    )}
                </div>
                <div className="orders-table__toolbar-right">
                    <Button
                        size="s"
                        view="flat"
                        onClick={() => setColumns(DEFAULT_COLUMNS)}
                        title="Сбросить порядок колонок"
                    >
                        <Icon data={ArrowRotateLeft} size={14} />
                        Колонки по умолчанию
                    </Button>
                    <Switch
                        checked={grouped}
                        onChange={(e) => setGrouped(e.target.checked)}
                        content="Группировать по статусу"
                    />
                </div>
            </div>

            <div className="orders-table__scroll">
                <table className="orders-table__table">
                    <thead>
                        <tr>
                            <th
                                className="orders-table__head-cell orders-table__cell_checkbox"
                                style={{width: CHECKBOX_COL_WIDTH}}
                            >
                                <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    onChange={(e) =>
                                        toggleMany(
                                            ORDERS.map((o) => o.id),
                                            e.target.checked,
                                        )
                                    }
                                    aria-label="Выбрать все заказы"
                                />
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    draggable
                                    onDragStart={handleDragStart(col.id)}
                                    onDragOver={handleDragOver(col.id)}
                                    onDragLeave={() =>
                                        setDragOverColId((prev) =>
                                            prev === col.id ? null : prev,
                                        )
                                    }
                                    onDrop={handleDrop(col.id)}
                                    onDragEnd={handleDragEnd}
                                    className={[
                                        'orders-table__head-cell',
                                        'orders-table__head-cell_draggable',
                                        dragColId === col.id
                                            ? 'orders-table__head-cell_dragging'
                                            : '',
                                        dragOverColId === col.id
                                            ? 'orders-table__head-cell_drop-target'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    style={{textAlign: col.align, width: col.width}}
                                    title="Перетащите, чтобы изменить порядок колонок"
                                >
                                    <span className="orders-table__head-content">
                                        <Icon
                                            data={Grip}
                                            size={12}
                                            className="orders-table__grip"
                                        />
                                        {col.title}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grouped && groups
                            ? groups.map((g) => renderGroup(g.status, g.orders))
                            : ORDERS.map(renderOrderRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function plural(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'заказ';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'заказа';
    return 'заказов';
}
