import { ChevronDown, ChevronRight, Grip } from '@gravity-ui/icons';
import { Checkbox, Icon, Label } from '@gravity-ui/uikit';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { STATUS_META, type Order, type OrderStatus } from './data';
import { checkState, moveItem, rangeIds, setMany, type CheckState, type TableRow } from './logic';

// ---------------------------------------------------------------- колонки

export type ColumnId = 'number' | 'customer' | 'createdAt' | 'status' | 'items' | 'total' | 'payment' | 'city' | 'manager';

interface Column {
    id: ColumnId;
    title: string;
    align?: 'start' | 'end';
    minWidth?: number;
    render: (order: Order) => ReactNode;
}

const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatMoney = (value: number) => money.format(value);

export const COLUMNS: Record<ColumnId, Column> = {
    number: {
        id: 'number',
        title: '№ заказа',
        minWidth: 100,
        render: (o) => <span className="orders__mono">#{o.number}</span>,
    },
    customer: {
        id: 'customer',
        title: 'Клиент',
        minWidth: 220,
        render: (o) => (
            <div className="orders__customer">
                <span>{o.customer}</span>
                <span className="orders__muted">{o.email}</span>
            </div>
        ),
    },
    createdAt: {
        id: 'createdAt',
        title: 'Дата',
        minWidth: 140,
        render: (o) => dateTime.format(new Date(o.createdAt)),
    },
    status: {
        id: 'status',
        title: 'Статус',
        minWidth: 120,
        render: (o) => (
            <Label theme={STATUS_META[o.status].theme} size="xs">
                {STATUS_META[o.status].label}
            </Label>
        ),
    },
    items: { id: 'items', title: 'Товаров', align: 'end', minWidth: 80, render: (o) => o.items },
    total: {
        id: 'total',
        title: 'Сумма',
        align: 'end',
        minWidth: 110,
        render: (o) => <span className="orders__mono">{formatMoney(o.total)}</span>,
    },
    payment: { id: 'payment', title: 'Оплата', minWidth: 150, render: (o) => o.payment },
    city: { id: 'city', title: 'Город', minWidth: 140, render: (o) => o.city },
    manager: { id: 'manager', title: 'Менеджер', minWidth: 120, render: (o) => o.manager },
};

export const DEFAULT_COLUMN_ORDER = Object.keys(COLUMNS) as ColumnId[];

// ---------------------------------------------------------------- таблица

interface OrdersTableProps {
    orders: readonly Order[];
    rows: readonly TableRow[];
    columnOrder: readonly ColumnId[];
    onColumnOrderChange: (order: ColumnId[]) => void;
    selected: ReadonlySet<string>;
    onSelectionChange: (next: ReadonlySet<string>) => void;
    onToggleGroup: (status: OrderStatus) => void;
    /** Сообщение для скринридеров (перенос колонки и т.п.). */
    announce: (message: string) => void;
}

type DropTarget = { id: ColumnId; side: 'before' | 'after' };

export function OrdersTable({
    orders,
    rows,
    columnOrder,
    onColumnOrderChange,
    selected,
    onSelectionChange,
    onToggleGroup,
    announce,
}: OrdersTableProps) {
    const columns = useMemo(() => columnOrder.map((id) => COLUMNS[id]), [columnOrder]);
    const allIds = useMemo(() => orders.map((o) => o.id), [orders]);
    const visibleIds = useMemo(
        () => rows.flatMap((r) => (r.kind === 'order' ? [r.order.id] : [])),
        [rows],
    );

    // --- выделение строк -------------------------------------------------
    // Колбэки стабильны (иначе memo-строки перерисуются все разом), а свежие
    // значения берём из ref.
    const latest = useRef({ selected, visibleIds, onSelectionChange });
    latest.current = { selected, visibleIds, onSelectionChange };
    const anchorRef = useRef<string | null>(null);

    const toggleRow = useCallback((id: string, withShift: boolean) => {
        const { selected, visibleIds, onSelectionChange } = latest.current;
        // Shift+клик применяет новое состояние кликнутой строки ко всему диапазону.
        const value = !selected.has(id);
        const ids = withShift ? rangeIds(visibleIds, anchorRef.current, id) : [id];
        anchorRef.current = id;
        onSelectionChange(setMany(selected, ids, value));
    }, []);

    const setGroupSelected = useCallback((ids: readonly string[], value: boolean) => {
        const { selected, onSelectionChange } = latest.current;
        onSelectionChange(setMany(selected, ids, value));
    }, []);

    const allState = checkState(allIds, selected);

    // --- перетаскивание колонок -------------------------------------------
    const [dragId, setDragId] = useState<ColumnId | null>(null);
    const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
    const gripRefs = useRef(new Map<ColumnId, HTMLButtonElement>());
    const focusAfterMove = useRef<ColumnId | null>(null);

    // Перенос DOM-узла сбрасывает фокус — возвращаем его на ручку колонки.
    useEffect(() => {
        if (focusAfterMove.current) {
            gripRefs.current.get(focusAfterMove.current)?.focus();
            focusAfterMove.current = null;
        }
    }, [columnOrder]);

    const insertIndex = (target: DropTarget) => columnOrder.indexOf(target.id) + (target.side === 'after' ? 1 : 0);
    const isNoopDrop = (from: number, target: DropTarget) => {
        const to = insertIndex(target);
        return to === from || to === from + 1;
    };

    const resetDrag = () => {
        setDragId(null);
        setDropTarget(null);
    };

    const onHeadDragStart = (e: DragEvent<HTMLTableCellElement>, id: ColumnId) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', COLUMNS[id].title); // без этого Firefox не начнёт drag
        setDragId(id);
    };

    const onHeadDragOver = (e: DragEvent<HTMLTableCellElement>, id: ColumnId) => {
        if (!dragId) return; // тащат что-то постороннее — не принимаем
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
        if (dropTarget?.id !== id || dropTarget.side !== side) setDropTarget({ id, side });
    };

    const onHeadDrop = (e: DragEvent<HTMLTableCellElement>) => {
        e.preventDefault();
        if (dragId && dropTarget) {
            const from = columnOrder.indexOf(dragId);
            if (!isNoopDrop(from, dropTarget)) {
                const next = moveItem(columnOrder, from, insertIndex(dropTarget));
                onColumnOrderChange(next);
                announce(`Колонка «${COLUMNS[dragId].title}» перемещена на позицию ${next.indexOf(dragId) + 1} из ${next.length}`);
            }
        }
        resetDrag();
    };

    const onGripKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: ColumnId) => {
        const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
        if (!delta) return;
        e.preventDefault();
        const from = columnOrder.indexOf(id);
        const to = from + delta;
        if (to < 0 || to >= columnOrder.length) return;
        const next = moveItem(columnOrder, from, delta > 0 ? to + 1 : to);
        focusAfterMove.current = id;
        onColumnOrderChange(next);
        announce(`Колонка «${COLUMNS[id].title}» на позиции ${to + 1} из ${next.length}`);
    };

    const dragFrom = dragId ? columnOrder.indexOf(dragId) : -1;
    const visibleDropTarget = dragId && dropTarget && !isNoopDrop(dragFrom, dropTarget) ? dropTarget : null;

    return (
        <table className="orders" aria-label="Заказы">
            <thead>
                <tr>
                    <th className="orders__select-cell" scope="col">
                        <Checkbox
                            checked={allState === 'all'}
                            indeterminate={allState === 'some'}
                            onUpdate={() => setGroupSelected(allIds, allState !== 'all')}
                            controlProps={{ 'aria-label': 'Выбрать все заказы' }}
                        />
                    </th>
                    {columns.map((col) => {
                        const classes = ['orders__head'];
                        if (col.align === 'end') classes.push('orders__cell_end');
                        if (col.id === dragId) classes.push('orders__head_dragging');
                        if (visibleDropTarget?.id === col.id) classes.push(`orders__head_drop-${visibleDropTarget.side}`);
                        return (
                            <th
                                key={col.id}
                                scope="col"
                                className={classes.join(' ')}
                                style={{ minWidth: col.minWidth }}
                                draggable
                                onDragStart={(e) => onHeadDragStart(e, col.id)}
                                onDragOver={(e) => onHeadDragOver(e, col.id)}
                                onDragLeave={(e) => {
                                    // Курсор ушёл с ячейки (а не на её потомка) — прячем индикатор.
                                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropTarget(null);
                                }}
                                onDrop={onHeadDrop}
                                onDragEnd={resetDrag}
                            >
                                <span className="orders__head-inner">
                                    <button
                                        type="button"
                                        className="orders__grip"
                                        ref={(el) => {
                                            if (el) gripRefs.current.set(col.id, el);
                                            else gripRefs.current.delete(col.id);
                                        }}
                                        aria-label={`Переместить колонку «${col.title}»`}
                                        aria-description="Стрелки влево и вправо меняют позицию колонки"
                                        onKeyDown={(e) => onGripKeyDown(e, col.id)}
                                    >
                                        <Icon data={Grip} size={12} />
                                    </button>
                                    {col.title}
                                </span>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0 ? (
                    <tr>
                        <td className="orders__empty" colSpan={columns.length + 1}>
                            Заказов нет
                        </td>
                    </tr>
                ) : (
                    rows.map((row) =>
                        row.kind === 'group' ? (
                            <GroupRow
                                key={`group-${row.status}`}
                                row={row}
                                colSpan={columns.length + 1}
                                checked={checkState(row.orders.map((o) => o.id), selected)}
                                onToggleCollapsed={onToggleGroup}
                                onSelect={setGroupSelected}
                            />
                        ) : (
                            <OrderRow
                                key={row.order.id}
                                order={row.order}
                                columns={columns}
                                selected={selected.has(row.order.id)}
                                onToggle={toggleRow}
                            />
                        ),
                    )
                )}
            </tbody>
        </table>
    );
}

// ---------------------------------------------------------------- строки

interface OrderRowProps {
    order: Order;
    columns: Column[];
    selected: boolean;
    onToggle: (id: string, withShift: boolean) => void;
}

const OrderRow = memo(function OrderRow({ order, columns, selected, onToggle }: OrderRowProps) {
    const onRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
        // Пользователь выделял текст мышью — это не клик по строке.
        if (window.getSelection()?.toString()) return;
        onToggle(order.id, e.shiftKey);
    };

    const onSelectCellClick = (e: MouseEvent<HTMLTableCellElement>) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        // Клик по <label> чекбокса браузер повторит кликом по <input> —
        // обрабатываем только его, чтобы не переключить строку дважды.
        if (target instanceof HTMLInputElement || !target.closest('label')) onToggle(order.id, e.shiftKey);
    };

    return (
        <tr
            className={`orders__row${selected ? ' orders__row_selected' : ''}`}
            onClick={onRowClick}
            // Shift+клик не должен выделять текст между строками.
            onMouseDown={(e) => e.shiftKey && e.preventDefault()}
        >
            <td className="orders__select-cell" onClick={onSelectCellClick}>
                <Checkbox checked={selected} controlProps={{ 'aria-label': `Выбрать заказ #${order.number}` }} />
            </td>
            {columns.map((col) => (
                <td key={col.id} className={col.align === 'end' ? 'orders__cell_end' : undefined}>
                    {col.render(order)}
                </td>
            ))}
        </tr>
    );
});

interface GroupRowProps {
    row: Extract<TableRow, { kind: 'group' }>;
    colSpan: number;
    checked: CheckState;
    onToggleCollapsed: (status: OrderStatus) => void;
    onSelect: (ids: readonly string[], value: boolean) => void;
}

function GroupRow({ row, colSpan, checked, onToggleCollapsed, onSelect }: GroupRowProps) {
    const meta = STATUS_META[row.status];
    const count = row.orders.length;
    return (
        <tr className="orders__group" onClick={() => onToggleCollapsed(row.status)}>
            <td colSpan={colSpan}>
                <div className="orders__group-inner">
                    <span onClick={(e) => e.stopPropagation()} className="orders__group-check">
                        <Checkbox
                            checked={checked === 'all'}
                            indeterminate={checked === 'some'}
                            onUpdate={() =>
                                onSelect(
                                    row.orders.map((o) => o.id),
                                    checked !== 'all',
                                )
                            }
                            controlProps={{ 'aria-label': `Выбрать все заказы со статусом «${meta.label}»` }}
                        />
                    </span>
                    <button
                        type="button"
                        className="orders__group-toggle"
                        aria-expanded={!row.collapsed}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCollapsed(row.status);
                        }}
                    >
                        <Icon data={row.collapsed ? ChevronRight : ChevronDown} size={14} />
                        <Label theme={meta.theme} size="xs">
                            {meta.label}
                        </Label>
                        <span className="orders__group-count">{pluralOrders(count)}</span>
                    </button>
                    <span className="orders__group-total">на {formatMoney(row.total)}</span>
                </div>
            </td>
        </tr>
    );
}

export function pluralOrders(n: number) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    const word =
        mod10 === 1 && mod100 !== 11
            ? 'заказ'
            : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
              ? 'заказа'
              : 'заказов';
    return `${n} ${word}`;
}
