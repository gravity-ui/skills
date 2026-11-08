import * as React from 'react';
import { ArrowDownToSquare, ChevronDown, ChevronRight, Grip, Magnifier, Sliders } from '@gravity-ui/icons';
import {
    ActionsPanel,
    type ActionsPanelProps,
    Button,
    Checkbox,
    Icon,
    Label,
    Switch,
    Table,
    TableColumnSetup,
    type TableColumnConfig,
    type TableColumnSetupItem,
    Text,
    TextInput,
} from '@gravity-ui/uikit';

import { useStoredState } from '../useStoredState';
import { STATUSES, STATUS_META, formatDate, formatMoney, pluralRu, type Order, type OrderStatus } from './data';
import {
    type GroupRow,
    type Row,
    buildRows,
    getCheckState,
    getRange,
    matchesQuery,
    moveColumn,
    normalizeColumnOrder,
    setSelected,
    shiftColumn,
} from './logic';

type ColumnId = 'id' | 'createdAt' | 'customer' | 'email' | 'city' | 'items' | 'payment' | 'amount' | 'status' | 'manager';

interface ColumnDef {
    title: string;
    align?: 'start' | 'end';
    render: (order: Order) => React.ReactNode;
    /** Значение для CSV-экспорта */
    text: (order: Order) => string | number;
}

const COLUMNS: Record<ColumnId, ColumnDef> = {
    id: { title: '№ заказа', render: (o) => <span className="orders-table__id">{o.id}</span>, text: (o) => o.id },
    createdAt: { title: 'Дата', render: (o) => formatDate(o.createdAt), text: (o) => formatDate(o.createdAt) },
    customer: { title: 'Клиент', render: (o) => o.customer, text: (o) => o.customer },
    email: { title: 'Email', render: (o) => o.email, text: (o) => o.email },
    city: { title: 'Город', render: (o) => o.city, text: (o) => o.city },
    items: { title: 'Товаров', align: 'end', render: (o) => o.items, text: (o) => o.items },
    payment: { title: 'Оплата', render: (o) => o.payment, text: (o) => o.payment },
    amount: {
        title: 'Сумма',
        align: 'end',
        render: (o) => <span className="orders-table__money">{formatMoney(o.amount)}</span>,
        text: (o) => o.amount,
    },
    status: {
        title: 'Статус',
        render: (o) => (
            <Label theme={STATUS_META[o.status].theme} size="xs">
                {STATUS_META[o.status].title}
            </Label>
        ),
        text: (o) => STATUS_META[o.status].title,
    },
    manager: { title: 'Менеджер', render: (o) => o.manager, text: (o) => o.manager },
};

const ALL_COLUMNS = Object.keys(COLUMNS) as ColumnId[];
const DEFAULT_HIDDEN: ColumnId[] = ['email'];
const REQUIRED_COLUMN: ColumnId = 'id';
const SELECTION_COLUMN_ID = '_selection';

const ORDER_FORMS: [string, string, string] = ['заказ', 'заказа', 'заказов'];

const BULK_ACTIONS: { status: OrderStatus; label: string }[] = [
    { status: 'processing', label: 'В обработку' },
    { status: 'shipped', label: 'Отправить' },
    { status: 'delivered', label: 'Доставлено' },
    { status: 'cancelled', label: 'Отменить' },
];

type DropTarget = { id: ColumnId; side: 'before' | 'after' };

/** Клики по контролам внутри строки не должны выделять/сворачивать строку. */
const isControlClick = (event: React.MouseEvent) =>
    Boolean((event.target as HTMLElement).closest('button, a, input, label, .g-checkbox'));

interface OrdersPageProps {
    orders: Order[];
    onOrdersChange: (updater: (orders: Order[]) => Order[]) => void;
}

export function OrdersPage({ orders, onOrdersChange }: OrdersPageProps) {
    const [query, setQuery] = React.useState('');
    const [grouped, setGrouped] = useStoredState('admin.orders.grouped', true, (v) => v === true);
    const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<OrderStatus>>(new Set());
    const [columnOrder, setColumnOrder] = useStoredState<ColumnId[]>('admin.orders.columnOrder', ALL_COLUMNS, (v) =>
        normalizeColumnOrder(v, ALL_COLUMNS),
    );
    const [hiddenColumns, setHiddenColumns] = useStoredState<ColumnId[]>('admin.orders.hiddenColumns', DEFAULT_HIDDEN, (v) =>
        Array.isArray(v) ? v.filter((id): id is ColumnId => ALL_COLUMNS.includes(id) && id !== REQUIRED_COLUMN) : DEFAULT_HIDDEN,
    );
    const [selected, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set());
    const [dragId, setDragId] = React.useState<ColumnId | null>(null);
    const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);
    const [announcement, setAnnouncement] = React.useState('');

    const anchorIdRef = React.useRef<string | null>(null);
    const tableWrapRef = React.useRef<HTMLDivElement>(null);
    const focusColumnRef = React.useRef<ColumnId | null>(null);

    // ---------- производные данные ----------
    const filtered = React.useMemo(() => orders.filter((o) => matchesQuery(o, query)), [orders, query]);
    const filteredIds = React.useMemo(() => filtered.map((o) => o.id), [filtered]);
    const rows = React.useMemo(() => buildRows(filtered, grouped, collapsedGroups), [filtered, grouped, collapsedGroups]);
    const visibleOrderIds = React.useMemo(
        () => rows.flatMap((r) => (r.kind === 'order' ? [r.id] : [])),
        [rows],
    );
    const visibleColumns = React.useMemo(
        () => columnOrder.filter((id) => !hiddenColumns.includes(id)),
        [columnOrder, hiddenColumns],
    );
    const selectedOrders = React.useMemo(() => orders.filter((o) => selected.has(o.id)), [orders, selected]);
    const groupsInView = React.useMemo(
        () => rows.filter((r): r is GroupRow => r.kind === 'group').map((r) => r.status),
        [rows],
    );

    // ---------- выделение ----------
    const toggleOrder = React.useCallback(
        (id: string, value: boolean, withRange: boolean) => {
            const anchor = anchorIdRef.current;
            const ids = withRange && anchor ? getRange(visibleOrderIds, anchor, id) : [id];
            setSelectedIds((prev) => setSelected(prev, ids, value));
            anchorIdRef.current = id;
        },
        [visibleOrderIds],
    );

    const toggleGroup = React.useCallback((status: OrderStatus) => {
        setCollapsedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(status)) next.delete(status);
            else next.add(status);
            return next;
        });
    }, []);

    // ---------- колонки ----------
    const applyColumnOrder = React.useCallback(
        (next: ColumnId[], movedId: ColumnId) => {
            setColumnOrder(next);
            const visible = next.filter((id) => !hiddenColumns.includes(id));
            setAnnouncement(`Колонка «${COLUMNS[movedId].title}» перемещена на позицию ${visible.indexOf(movedId) + 1} из ${visible.length}`);
        },
        [hiddenColumns, setColumnOrder],
    );

    const shiftColumnByKeyboard = React.useCallback(
        (id: ColumnId, delta: -1 | 1) => {
            const next = shiftColumn(columnOrder, visibleColumns, id, delta);
            if (next.join() === columnOrder.join()) return;
            focusColumnRef.current = id;
            applyColumnOrder(next, id);
        },
        [applyColumnOrder, columnOrder, visibleColumns],
    );

    // React переносит <th> в DOM при перестановке — возвращаем фокус на перемещённый заголовок
    React.useLayoutEffect(() => {
        const id = focusColumnRef.current;
        if (!id) return;
        focusColumnRef.current = null;
        tableWrapRef.current?.querySelector<HTMLElement>(`[data-col-id="${id}"]`)?.focus();
    }, [columnOrder]);

    const endDrag = React.useCallback(() => {
        setDragId(null);
        setDropTarget(null);
    }, []);

    // Таблица целиком (включая служебную колонку) — индекс ячейки = индекс колонки
    const tableColumnIds = React.useMemo(() => [SELECTION_COLUMN_ID, ...visibleColumns], [visibleColumns]);

    /** Определяет, над какой колонкой (и какой её половиной) сейчас курсор. */
    const resolveDropTarget = (event: React.DragEvent): DropTarget | null => {
        const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>('th, td');
        if (!cell || !tableWrapRef.current?.contains(cell)) return null;
        const id = tableColumnIds[cell.cellIndex] as ColumnId | typeof SELECTION_COLUMN_ID | undefined;
        if (!id || id === SELECTION_COLUMN_ID || id === dragId) return null;
        const rect = cell.getBoundingClientRect();
        const before = event.clientX < rect.left + rect.width / 2;
        // в RTL «до» визуально справа
        const rtl = getComputedStyle(cell).direction === 'rtl';
        const side = before !== rtl ? 'before' : 'after';
        // бросок вплотную к перетаскиваемой колонке ничего не меняет — не подсвечиваем
        if (dragId) {
            const next = moveColumn(visibleColumns, dragId, id, side);
            if (next.join() === visibleColumns.join()) return null;
        }
        return { id, side };
    };

    const handleDragOver = (event: React.DragEvent) => {
        if (!dragId) return;
        event.preventDefault();
        const target = resolveDropTarget(event);
        event.dataTransfer.dropEffect = target ? 'move' : 'none';
        setDropTarget((prev) => (prev?.id === target?.id && prev?.side === target?.side ? prev : target));
    };

    const handleDrop = (event: React.DragEvent) => {
        if (!dragId) return;
        event.preventDefault();
        const target = resolveDropTarget(event);
        if (target) applyColumnOrder(moveColumn(columnOrder, dragId, target.id, target.side), dragId);
        endDrag();
    };

    const handleDragLeave = (event: React.DragEvent) => {
        if (!tableWrapRef.current?.contains(event.relatedTarget as Node | null)) setDropTarget(null);
    };

    // ---------- конфиг колонок Gravity Table ----------
    const columns = React.useMemo((): TableColumnConfig<Row>[] => {
        const headState = getCheckState(filteredIds, selected);
        const firstDataColumn = visibleColumns[0];

        const selectionColumn: TableColumnConfig<Row> = {
            id: SELECTION_COLUMN_ID,
            className: 'orders-table__check-cell',
            sticky: 'start',
            name: () => (
                <Checkbox
                    size="l"
                    checked={headState.checked}
                    indeterminate={headState.indeterminate}
                    disabled={filteredIds.length === 0}
                    onUpdate={(value) => setSelectedIds((prev) => setSelected(prev, filteredIds, value))}
                    controlProps={{ 'aria-label': 'Выбрать все заказы' }}
                />
            ),
            template: (row) => {
                if (row.kind === 'group') {
                    const ids = row.orders.map((o) => o.id);
                    const state = getCheckState(ids, selected);
                    return (
                        <Checkbox
                            size="l"
                            checked={state.checked}
                            indeterminate={state.indeterminate}
                            onUpdate={(value) => setSelectedIds((prev) => setSelected(prev, ids, value))}
                            controlProps={{ 'aria-label': `Выбрать все заказы со статусом «${STATUS_META[row.status].title}»` }}
                        />
                    );
                }
                return (
                    <Checkbox
                        size="l"
                        checked={selected.has(row.id)}
                        onChange={(event) =>
                            toggleOrder(row.id, event.target.checked, (event.nativeEvent as MouseEvent).shiftKey)
                        }
                        controlProps={{ 'aria-label': `Выбрать заказ ${row.id}` }}
                    />
                );
            },
        };

        const dataColumns = visibleColumns.map((id): TableColumnConfig<Row> => {
            const def = COLUMNS[id];
            const classNames = ['orders-table__cell'];
            if (id === dragId) classNames.push('orders-table__cell_dragging');
            if (dropTarget?.id === id) classNames.push(`orders-table__cell_drop-${dropTarget.side}`);

            return {
                id,
                align: def.align,
                className: classNames.join(' '),
                // первая колонка закреплена: в ней же рисуется заголовок группы
                sticky: id === firstDataColumn ? 'start' : undefined,
                primary: id === 'id',
                name: () => (
                    <ColumnHeader
                        id={id}
                        title={def.title}
                        dragging={id === dragId}
                        onDragStart={setDragId}
                        onDragEnd={endDrag}
                        onShift={shiftColumnByKeyboard}
                    />
                ),
                placeholder: (row) => (row.kind === 'group' ? '' : '—'),
                template: (row) => {
                    if (row.kind === 'order') return def.render(row.order);
                    return id === firstDataColumn ? (
                        <GroupHeader group={row} collapsed={collapsedGroups.has(row.status)} onToggle={toggleGroup} />
                    ) : null;
                },
            };
        });

        return [selectionColumn, ...dataColumns];
    }, [collapsedGroups, dragId, dropTarget, endDrag, filteredIds, selected, shiftColumnByKeyboard, toggleGroup, toggleOrder, visibleColumns]);

    const getRowDescriptor = React.useCallback(
        (row: Row) => {
            const classNames = [`orders-table__row_${row.kind}`];
            if (row.kind === 'order' && selected.has(row.id)) classNames.push('orders-table__row_selected');
            return { id: row.id, classNames, interactive: true };
        },
        [selected],
    );

    const handleRowClick = (row: Row, _index: number, event: React.MouseEvent<HTMLTableRowElement>) => {
        if (isControlClick(event)) return;
        if (row.kind === 'group') toggleGroup(row.status);
        else toggleOrder(row.id, !selected.has(row.id), event.shiftKey);
    };

    // Shift+клик по строке не должен выделять текст
    const handleRowMouseDown = (_row: Row, _index: number, event: React.MouseEvent) => {
        if (event.shiftKey && !isControlClick(event)) event.preventDefault();
    };

    // ---------- массовые действия ----------
    const setStatusForSelected = React.useCallback(
        (status: OrderStatus) => {
            onOrdersChange((prev) => prev.map((o) => (selected.has(o.id) ? { ...o, status } : o)));
            setAnnouncement(
                `${selected.size} ${pluralRu(selected.size, ORDER_FORMS)} → «${STATUS_META[status].title}»`,
            );
        },
        [onOrdersChange, selected],
    );

    const exportCsv = React.useCallback(() => {
        const escape = (v: string | number) => {
            const s = String(v);
            return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const lines = [
            visibleColumns.map((id) => escape(COLUMNS[id].title)).join(';'),
            ...selectedOrders.map((o) => visibleColumns.map((id) => escape(COLUMNS[id].text(o))).join(';')),
        ];
        // BOM — чтобы Excel корректно открыл кириллицу
        const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [selectedOrders, visibleColumns]);

    const actions = React.useMemo((): ActionsPanelProps["actions"] => {
        const statusActions = BULK_ACTIONS.map(({ status, label }) => ({
            id: status,
            button: { props: { children: label, onClick: () => setStatusForSelected(status) } },
            dropdown: { item: { text: label, action: () => setStatusForSelected(status) } },
        }));
        return [
            ...statusActions,
            {
                id: 'export',
                button: {
                    props: {
                        children: [<Icon key="i" data={ArrowDownToSquare} size={16} />, 'CSV'],
                        onClick: exportCsv,
                    },
                },
                dropdown: { item: { text: 'Экспорт в CSV', action: exportCsv } },
            },
        ];
    }, [exportCsv, setStatusForSelected]);

    // ---------- настройка колонок (видимость + порядок) ----------
    const setupItems = React.useMemo(
        (): TableColumnSetupItem[] =>
            columnOrder.map((id) => ({
                id,
                title: COLUMNS[id].title,
                selected: !hiddenColumns.includes(id),
                required: id === REQUIRED_COLUMN,
            })),
        [columnOrder, hiddenColumns],
    );

    const handleSetupUpdate = (items: TableColumnSetupItem[]) => {
        setColumnOrder(normalizeColumnOrder(items.map((i) => i.id), ALL_COLUMNS));
        setHiddenColumns(items.filter((i) => !i.selected && i.id !== REQUIRED_COLUMN).map((i) => i.id as ColumnId));
    };

    const allCollapsed = groupsInView.length > 0 && groupsInView.every((s) => collapsedGroups.has(s));
    const selectedTotal = selectedOrders.reduce((sum, o) => sum + o.amount, 0);

    return (
        <div className={`orders-page${selected.size > 0 ? ' orders-page_has-actions' : ''}`}>
            <header className="orders-page__header">
                <div>
                    <Text as="h1" variant="header-1">
                        Заказы
                    </Text>
                    <Text color="secondary" as="div">
                        {orders.length} {pluralRu(orders.length, ORDER_FORMS)} · {STATUSES.length} статусов
                    </Text>
                </div>
            </header>

            <div className="orders-page__toolbar" role="toolbar" aria-label="Управление таблицей">
                <TextInput
                    className="orders-page__search"
                    value={query}
                    onUpdate={setQuery}
                    placeholder="Поиск: номер, клиент, город…"
                    hasClear
                    startContent={<Icon data={Magnifier} size={16} className="orders-page__search-icon" />}
                    controlProps={{ 'aria-label': 'Поиск заказов' }}
                />
                <Switch checked={grouped} onUpdate={setGrouped} content="Группировать по статусу" />
                {grouped && groupsInView.length > 0 ? (
                    <Button
                        view="flat-secondary"
                        onClick={() => setCollapsedGroups(allCollapsed ? new Set() : new Set(groupsInView))}
                    >
                        {allCollapsed ? 'Развернуть все' : 'Свернуть все'}
                    </Button>
                ) : null}
                <div className="orders-page__spacer" />
                <TableColumnSetup
                    items={setupItems}
                    onUpdate={handleSetupUpdate}
                    sortable
                    popupPlacement={['bottom-end', 'top-end']}
                    renderSwitcher={({ onClick, onKeyDown }) => (
                        <Button view="outlined" onClick={onClick} onKeyDown={onKeyDown}>
                            <Icon data={Sliders} size={16} />
                            Колонки
                        </Button>
                    )}
                />
            </div>

            <div
                ref={tableWrapRef}
                className={`orders-page__table${dragId ? ' orders-page__table_dragging' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
            >
                <Table<Row>
                    className="orders-table"
                    data={rows}
                    columns={columns}
                    getRowDescriptor={getRowDescriptor}
                    onRowClick={handleRowClick}
                    onRowMouseDown={handleRowMouseDown}
                    emptyMessage={query ? `По запросу «${query}» ничего не найдено` : 'Заказов пока нет'}
                    width="max"
                    edgePadding
                    aria-label="Заказы"
                />
            </div>

            <footer className="orders-page__footer">
                <Text color="secondary">
                    Показано {filtered.length} из {orders.length}
                    {grouped && groupsInView.length ? ` · групп: ${groupsInView.length}` : ''}
                </Text>
                <Text color="secondary" className="orders-page__hint">
                    Перетащите заголовок колонки, чтобы поменять порядок · Shift+клик — выделить диапазон
                </Text>
            </footer>

            {selected.size > 0 ? (
                <ActionsPanel
                    className="orders-page__actions"
                    noteClassName="orders-page__actions-note"
                    actions={actions}
                    onClose={() => setSelectedIds(new Set())}
                    renderNote={() => (
                        <span>
                            Выбрано {selected.size} {pluralRu(selected.size, ORDER_FORMS)} · {formatMoney(selectedTotal)}
                        </span>
                    )}
                />
            ) : null}

            <div className="visually-hidden" aria-live="polite">
                {announcement}
            </div>
        </div>
    );
}

interface ColumnHeaderProps {
    id: ColumnId;
    title: string;
    dragging: boolean;
    onDragStart: (id: ColumnId) => void;
    onDragEnd: () => void;
    onShift: (id: ColumnId, delta: -1 | 1) => void;
}

function ColumnHeader({ id, title, dragging, onDragStart, onDragEnd, onShift }: ColumnHeaderProps) {
    return (
        <span
            className={`col-head${dragging ? ' col-head_dragging' : ''}`}
            data-col-id={id}
            draggable
            tabIndex={0}
            aria-roledescription="перемещаемая колонка"
            aria-label={`${title}. Alt + стрелка влево или вправо — переместить колонку`}
            title="Перетащите, чтобы переместить колонку (или Alt + ← / →)"
            onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', id); // нужно Firefox, чтобы drag вообще начался
                onDragStart(id);
            }}
            onDragEnd={onDragEnd}
            onKeyDown={(event) => {
                if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
                event.preventDefault();
                const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
                const left = event.key === 'ArrowLeft';
                onShift(id, left !== rtl ? -1 : 1);
            }}
        >
            <span className="col-head__title">{title}</span>
            <Icon data={Grip} size={12} className="col-head__grip" />
        </span>
    );
}

interface GroupHeaderProps {
    group: GroupRow;
    collapsed: boolean;
    onToggle: (status: OrderStatus) => void;
}

function GroupHeader({ group, collapsed, onToggle }: GroupHeaderProps) {
    const meta = STATUS_META[group.status];
    const count = group.orders.length;
    return (
        <span className="group-head">
            <Button
                view="flat"
                size="s"
                onClick={() => onToggle(group.status)}
                aria-expanded={!collapsed}
                aria-label={`${collapsed ? 'Развернуть' : 'Свернуть'} группу «${meta.title}»`}
            >
                <Icon data={collapsed ? ChevronRight : ChevronDown} size={16} />
            </Button>
            <Label theme={meta.theme} size="s">
                {meta.title}
            </Label>
            <span className="group-head__count">
                {count} {pluralRu(count, ORDER_FORMS)}
            </span>
            <span className="group-head__sum">на {formatMoney(group.total)}</span>
        </span>
    );
}
