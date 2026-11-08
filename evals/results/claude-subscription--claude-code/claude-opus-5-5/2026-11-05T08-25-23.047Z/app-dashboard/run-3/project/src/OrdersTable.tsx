import * as React from 'react';
import {Grip} from '@gravity-ui/icons';
import type {TableColumnConfig, TableSettingsData} from '@gravity-ui/uikit';
import {
    ArrowToggle,
    Button,
    Checkbox,
    Icon,
    Label,
    SegmentedRadioGroup,
    Table,
    Text,
    TextInput,
    withTableSettings,
} from '@gravity-ui/uikit';

import type {Order, OrderStatus} from './data';
import {PAYMENT_TITLES, STATUS_BY_ID, formatDate, formatMoney} from './data';
import type {CheckState, GroupRow, Row} from './tableModel';
import {buildRows, getCheckState, moveColumn, normalizeSettings, shiftColumn, toggleMany, toggleWithRange} from './tableModel';
import {usePersistentState} from './usePersistentState';

/**
 * id `_selection` зарезервирован в Gravity UI: withTableSettings всегда держит такую колонку первой
 * и не показывает её в настройках. Выделение реализовано своё (а не withTableSelection),
 * чтобы у строк-групп был собственный чекбокс «выбрать всю группу».
 */
const SELECTION_COLUMN_ID = '_selection';

const SettingsTable = withTableSettings<Row>({sortable: true, width: 260})(Table);

interface DataColumn {
    id: string;
    title: string;
    width?: number;
    align?: 'start' | 'end';
    render: (order: Order) => React.ReactNode;
}

const DATA_COLUMNS: DataColumn[] = [
    {id: 'number', title: '№ заказа', width: 96, render: (o) => <span className="orders-table__number">#{o.number}</span>},
    {id: 'createdAt', title: 'Создан', width: 136, render: (o) => formatDate(o.createdAt)},
    {id: 'customer', title: 'Клиент', render: (o) => o.customer},
    {id: 'city', title: 'Город', render: (o) => o.city},
    {id: 'items', title: 'Товаров', width: 72, align: 'end', render: (o) => o.items},
    {id: 'amount', title: 'Сумма', width: 110, align: 'end', render: (o) => formatMoney(o.amount)},
    {id: 'payment', title: 'Оплата', width: 90, render: (o) => PAYMENT_TITLES[o.payment]},
    {
        id: 'status',
        title: 'Статус',
        width: 120,
        render: (o) => (
            <Label theme={STATUS_BY_ID[o.status].theme} size="xs">
                {STATUS_BY_ID[o.status].title}
            </Label>
        ),
    },
    {id: 'manager', title: 'Менеджер', render: (o) => o.manager},
];

const COLUMN_IDS = DATA_COLUMNS.map((c) => c.id);
const COLUMN_TITLES = Object.fromEntries(DATA_COLUMNS.map((c) => [c.id, c.title]));

function plural(n: number, [one, few, many]: [string, string, string]) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
}
const ordersWord = (n: number) => `${n} ${plural(n, ['заказ', 'заказа', 'заказов'])}`;

function matches(order: Order, query: string) {
    if (!query) return true;
    return (
        String(order.number).includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.city.toLowerCase().includes(query) ||
        order.manager.toLowerCase().includes(query)
    );
}

/** Чекбокс внутри строки: клик по нему не должен ещё раз срабатывать как клик по строке. */
function CellCheckbox({
    state,
    label,
    onToggle,
}: {
    state: CheckState;
    label: string;
    onToggle: (shift: boolean) => void;
}) {
    return (
        <span className="orders-table__checkbox" onClick={(e) => e.stopPropagation()}>
            <Checkbox
                size="m"
                checked={state === 'all'}
                indeterminate={state === 'some'}
                controlProps={{'aria-label': label}}
                onChange={(e) => onToggle((e.nativeEvent as MouseEvent).shiftKey === true)}
            />
        </span>
    );
}

type DragState = {sourceId: string; targetId: string | null; side: 'before' | 'after'};

/** Находит колонку (и её заголовок) под курсором — бросать можно на любую ячейку колонки, не только на заголовок. */
function findColumnUnderPointer(target: EventTarget | null) {
    const cell = (target as Element | null)?.closest?.('td, th') as HTMLTableCellElement | null;
    const header = cell?.closest('table')?.tHead?.rows[0]?.cells[cell.cellIndex];
    const id = header?.querySelector<HTMLElement>('[data-column-id]')?.dataset.columnId;
    return id && header ? {id, header} : null;
}

export function OrdersTable({orders}: {orders: Order[]}) {
    const [query, setQuery] = React.useState('');
    const [grouped, setGrouped] = usePersistentState('orders.grouped', (raw) => raw !== false);
    const [collapsed, setCollapsed] = React.useState<ReadonlySet<OrderStatus>>(() => new Set());
    const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());
    const anchorRef = React.useRef<string | null>(null);
    const [settings, setSettings] = usePersistentState('orders.columns', (raw) => normalizeSettings(raw, COLUMN_IDS));
    const [drag, setDrag] = React.useState<DragState | null>(null);
    const [announcement, setAnnouncement] = React.useState('');
    const focusColumnRef = React.useRef<string | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const normalizedQuery = query.trim().toLowerCase();
    const filtered = React.useMemo(() => orders.filter((o) => matches(o, normalizedQuery)), [orders, normalizedQuery]);
    const filteredIds = React.useMemo(() => filtered.map((o) => o.id), [filtered]);
    const rows = React.useMemo(() => buildRows(filtered, grouped, collapsed), [filtered, grouped, collapsed]);
    const visibleOrderIds = React.useMemo(() => rows.filter((r) => r.kind === 'order').map((r) => r.id), [rows]);
    const headerState = getCheckState(filteredIds, selected);

    const selectedTotal = React.useMemo(
        () => orders.reduce((sum, o) => (selected.has(o.id) ? sum + o.amount : sum), 0),
        [orders, selected],
    );

    const toggleRow = React.useCallback(
        (id: string, shift: boolean) => {
            // Якорь читаем до setState: updater выполнится позже, когда ref уже будет перезаписан.
            const anchor = anchorRef.current;
            setSelected((prev) => toggleWithRange(prev, id, visibleOrderIds, anchor, shift));
            if (!shift || anchor === null) anchorRef.current = id;
        },
        [visibleOrderIds],
    );

    const toggleGroupCollapsed = React.useCallback((status: OrderStatus) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(status)) next.delete(status);
            else next.add(status);
            return next;
        });
    }, []);

    const updateSettings = React.useCallback(
        (next: TableSettingsData) => setSettings(normalizeSettings(next, COLUMN_IDS)),
        [setSettings],
    );

    const announceMove = (id: string, nextSettings: TableSettingsData) => {
        const visible = nextSettings.filter((s) => s.isSelected !== false);
        const position = visible.findIndex((s) => s.id === id) + 1;
        setAnnouncement(`Колонка «${COLUMN_TITLES[id]}» перемещена на позицию ${position} из ${visible.length}`);
    };

    // После перестановки с клавиатуры React переносит <th> в DOM, и фокус теряется — возвращаем его.
    React.useEffect(() => {
        const id = focusColumnRef.current;
        if (!id) return;
        focusColumnRef.current = null;
        containerRef.current?.querySelector<HTMLElement>(`[data-column-id="${id}"]`)?.focus();
    }, [settings]);

    const handleHeaderKeyDown = (id: string, e: React.KeyboardEvent) => {
        if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
        e.preventDefault();
        const next = shiftColumn(settings, id, e.key === 'ArrowLeft' ? -1 : 1);
        focusColumnRef.current = id;
        setSettings(next);
        announceMove(id, next);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!drag) return;
        const found = findColumnUnderPointer(e.target);
        if (!found) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = found.header.getBoundingClientRect();
        const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
        if (drag.targetId !== found.id || drag.side !== side) {
            setDrag({...drag, targetId: found.id, side});
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!drag) return;
        e.preventDefault();
        const found = findColumnUnderPointer(e.target);
        if (found && found.id !== drag.sourceId) {
            const next = moveColumn(settings, drag.sourceId, found.id, drag.side);
            setSettings(next);
            announceMove(drag.sourceId, next);
        }
        setDrag(null);
    };

    const columns = React.useMemo((): TableColumnConfig<Row>[] => {
        const renderGroup = (group: GroupRow) => {
            const status = STATUS_BY_ID[group.status];
            return (
                <div className="orders-group">
                    <CellCheckbox
                        state={getCheckState(group.orderIds, selected)}
                        label={`Выбрать все заказы со статусом «${status.title}»`}
                        onToggle={() => setSelected((prev) => toggleMany(prev, group.orderIds))}
                    />
                    {/* Клик по любому месту строки-группы тоже сворачивает её (см. onRowClick),
                        кнопка нужна для клавиатуры и скринридеров. */}
                    <button
                        type="button"
                        className="orders-group__toggle"
                        aria-expanded={!group.collapsed}
                        aria-label={`${group.collapsed ? 'Развернуть' : 'Свернуть'} группу «${status.title}»`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleGroupCollapsed(group.status);
                        }}
                    >
                        <ArrowToggle direction={group.collapsed ? 'right' : 'bottom'} size={14} />
                    </button>
                    <Label theme={status.theme} size="s">
                        {status.title}
                    </Label>
                    <Text color="secondary">
                        {ordersWord(group.orderIds.length)} · {formatMoney(group.total)}
                    </Text>
                </div>
            );
        };

        const selectionColumn: TableColumnConfig<Row> = {
            id: SELECTION_COLUMN_ID,
            width: 20,
            className: 'orders-table__selection-cell',
            name: () => (
                <CellCheckbox
                    state={headerState}
                    label="Выбрать все заказы"
                    onToggle={() => setSelected((prev) => toggleMany(prev, filteredIds))}
                />
            ),
            template: (row) =>
                row.kind === 'group' ? (
                    renderGroup(row)
                ) : (
                    <CellCheckbox
                        state={selected.has(row.id) ? 'all' : 'none'}
                        label={`Выбрать заказ #${row.order.number}`}
                        onToggle={(shift) => toggleRow(row.id, shift)}
                    />
                ),
        };

        const dataColumns = DATA_COLUMNS.map((column): TableColumnConfig<Row> => {
            const classNames = [`orders-col`];
            if (drag?.sourceId === column.id) classNames.push('orders-col_dragging');
            if (drag && drag.targetId === column.id && drag.sourceId !== column.id) {
                classNames.push(`orders-col_drop-${drag.side}`);
            }
            return {
                id: column.id,
                width: column.width,
                align: column.align,
                className: classNames.join(' '),
                meta: {displayName: column.title},
                name: () => (
                    <div
                        className={`orders-th${column.align === 'end' ? ' orders-th_align-end' : ''}`}
                        data-column-id={column.id}
                        draggable
                        tabIndex={0}
                        aria-roledescription="перемещаемая колонка"
                        aria-description="Перетащите мышью или нажмите Alt + стрелка влево/вправо"
                        title="Перетащите, чтобы поменять колонки местами"
                        onKeyDown={(e) => handleHeaderKeyDown(column.id, e)}
                        onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', column.id);
                            setDrag({sourceId: column.id, targetId: null, side: 'before'});
                        }}
                        onDragEnd={() => setDrag(null)}
                    >
                        <span className="orders-th__title">{column.title}</span>
                        <Icon data={Grip} size={12} className="orders-th__grip" />
                    </div>
                ),
                // Для строк-групп ячейки данных пустые (без «—»): подпись группы растягивается поверх них.
                placeholder: (row) => (row.kind === 'group' ? '' : '—'),
                template: (row) => (row.kind === 'group' ? '' : column.render(row.order)),
            };
        });

        return [selectionColumn, ...dataColumns];
        // handleHeaderKeyDown пересоздаётся каждый рендер, но зависит только от settings, которые есть в списке.
    }, [selected, headerState, filteredIds, drag, settings, toggleRow, toggleGroupCollapsed]);

    const getRowDescriptor = React.useCallback(
        (row: Row) => ({
            id: row.id,
            interactive: true,
            classNames:
                row.kind === 'group'
                    ? ['orders-group-row']
                    : selected.has(row.id)
                      ? ['orders-row', 'orders-row_selected']
                      : ['orders-row'],
        }),
        [selected],
    );

    return (
        <section className="orders" aria-labelledby="orders-title">
            <header className="orders__toolbar">
                <div className="orders__title">
                    <Text variant="header-1" id="orders-title" as="h1">
                        Заказы
                    </Text>
                    <Text color="secondary">
                        {filtered.length === orders.length
                            ? ordersWord(orders.length)
                            : `${filtered.length} из ${orders.length}`}
                    </Text>
                </div>
                <div className="orders__controls">
                    <TextInput
                        className="orders__search"
                        placeholder="Номер, клиент, город, менеджер"
                        value={query}
                        onUpdate={setQuery}
                        hasClear
                        controlProps={{'aria-label': 'Поиск по заказам'}}
                    />
                    <SegmentedRadioGroup
                        aria-label="Группировка строк"
                        value={grouped ? 'status' : 'none'}
                        onUpdate={(value) => setGrouped(value === 'status')}
                    >
                        <SegmentedRadioGroup.Option value="none">Без группировки</SegmentedRadioGroup.Option>
                        <SegmentedRadioGroup.Option value="status">По статусу</SegmentedRadioGroup.Option>
                    </SegmentedRadioGroup>
                </div>
            </header>

            <div
                ref={containerRef}
                className={`orders-table${drag ? ' orders-table_dragging' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <SettingsTable
                    className="orders-table__grid"
                    width="max"
                    data={rows}
                    columns={columns}
                    settings={settings}
                    updateSettings={updateSettings}
                    getRowDescriptor={getRowDescriptor}
                    onRowClick={(row, _index, e) => {
                        if (row.kind === 'group') toggleGroupCollapsed(row.status);
                        else toggleRow(row.id, e.shiftKey);
                    }}
                    // Иначе Shift+клик выделяет текст в ячейках.
                    onRowMouseDown={(_row, _index, e) => {
                        if (e.shiftKey) e.preventDefault();
                    }}
                    emptyMessage="Заказы не найдены"
                />
            </div>

            <footer className="orders__footer" aria-live="polite">
                {selected.size > 0 ? (
                    <>
                        <Text>
                            Выбрано: <b>{ordersWord(selected.size)}</b> на сумму <b>{formatMoney(selectedTotal)}</b>
                        </Text>
                        <Button view="flat-secondary" size="s" onClick={() => setSelected(new Set())}>
                            Снять выделение
                        </Button>
                    </>
                ) : (
                    <Text color="secondary">
                        Клик по строке выделяет заказ, Shift + клик — диапазон. Колонки можно перетаскивать за
                        заголовок.
                    </Text>
                )}
            </footer>

            <div className="visually-hidden" aria-live="assertive">
                {announcement}
            </div>
        </section>
    );
}
