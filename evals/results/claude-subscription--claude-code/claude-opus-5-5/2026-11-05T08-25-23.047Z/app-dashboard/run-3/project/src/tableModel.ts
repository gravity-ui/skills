import type {Order, OrderStatus} from './data';
import {STATUSES} from './data';

export interface GroupRow {
    kind: 'group';
    id: string;
    status: OrderStatus;
    orderIds: string[];
    total: number;
    collapsed: boolean;
}

export interface OrderRow {
    kind: 'order';
    id: string;
    order: Order;
}

export type Row = GroupRow | OrderRow;

/**
 * Превращает список заказов в плоский список строк таблицы.
 * При группировке перед заказами каждого статуса вставляется строка-заголовок группы;
 * заказы свёрнутых групп в результат не попадают. Пустые группы не показываются.
 */
export function buildRows(orders: Order[], grouped: boolean, collapsed: ReadonlySet<OrderStatus>): Row[] {
    if (!grouped) {
        return orders.map((order) => ({kind: 'order', id: order.id, order}));
    }

    const byStatus = new Map<OrderStatus, Order[]>();
    for (const order of orders) {
        const list = byStatus.get(order.status);
        if (list) list.push(order);
        else byStatus.set(order.status, [order]);
    }

    const rows: Row[] = [];
    for (const {id: status} of STATUSES) {
        const list = byStatus.get(status);
        if (!list?.length) continue;
        const isCollapsed = collapsed.has(status);
        rows.push({
            kind: 'group',
            id: `group:${status}`,
            status,
            orderIds: list.map((o) => o.id),
            total: list.reduce((sum, o) => sum + o.amount, 0),
            collapsed: isCollapsed,
        });
        if (!isCollapsed) {
            for (const order of list) rows.push({kind: 'order', id: order.id, order});
        }
    }
    return rows;
}

export type CheckState = 'none' | 'some' | 'all';

export function getCheckState(ids: readonly string[], selected: ReadonlySet<string>): CheckState {
    if (ids.length === 0) return 'none';
    let count = 0;
    for (const id of ids) if (selected.has(id)) count++;
    if (count === 0) return 'none';
    return count === ids.length ? 'all' : 'some';
}

/** Выделяет все `ids`, если выделены не все; иначе снимает с них выделение. */
export function toggleMany(selected: ReadonlySet<string>, ids: readonly string[]): Set<string> {
    const next = new Set(selected);
    const selectAll = getCheckState(ids, selected) !== 'all';
    for (const id of ids) {
        if (selectAll) next.add(id);
        else next.delete(id);
    }
    return next;
}

/**
 * Клик по строке. Без Shift — переключает одну строку.
 * С Shift — применяет состояние якорной строки ко всему диапазону между якорем и `id`
 * в порядке `visibleIds` (как в файловых менеджерах).
 */
export function toggleWithRange(
    selected: ReadonlySet<string>,
    id: string,
    visibleIds: readonly string[],
    anchorId: string | null,
    shift: boolean,
): Set<string> {
    const next = new Set(selected);
    const from = anchorId === null ? -1 : visibleIds.indexOf(anchorId);
    const to = visibleIds.indexOf(id);

    if (!shift || from === -1 || to === -1 || from === to) {
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    }

    const select = selected.has(anchorId!);
    const [start, end] = from < to ? [from, to] : [to, from];
    for (let i = start; i <= end; i++) {
        if (select) next.add(visibleIds[i]);
        else next.delete(visibleIds[i]);
    }
    return next;
}

export interface ColumnSetting {
    id: string;
    isSelected?: boolean;
}

/**
 * Переносит колонку `sourceId` до или после `targetId`.
 * Работает с полным списком настроек, так что скрытые колонки сохраняют свои места.
 */
export function moveColumn<T extends ColumnSetting>(
    settings: readonly T[],
    sourceId: string,
    targetId: string,
    side: 'before' | 'after',
): T[] {
    if (sourceId === targetId) return [...settings];
    const source = settings.find((s) => s.id === sourceId);
    if (!source || !settings.some((s) => s.id === targetId)) return [...settings];

    const rest = settings.filter((s) => s.id !== sourceId);
    const targetIndex = rest.findIndex((s) => s.id === targetId);
    rest.splice(side === 'before' ? targetIndex : targetIndex + 1, 0, source);
    return rest;
}

/** Сдвигает колонку на одну позицию среди видимых (для управления с клавиатуры). */
export function shiftColumn<T extends ColumnSetting>(settings: readonly T[], id: string, delta: -1 | 1): T[] {
    const visible = settings.filter((s) => s.isSelected !== false);
    const index = visible.findIndex((s) => s.id === id);
    const neighbour = visible[index + delta];
    if (index === -1 || !neighbour) return [...settings];
    return moveColumn(settings, id, neighbour.id, delta < 0 ? 'before' : 'after');
}

/** Приводит сохранённые настройки к актуальному набору колонок (новые — в конец, удалённые — выкидываются). */
export function normalizeSettings(saved: unknown, columnIds: readonly string[]): ColumnSetting[] {
    const known = new Set(columnIds);
    const result: ColumnSetting[] = [];
    const seen = new Set<string>();
    if (Array.isArray(saved)) {
        for (const item of saved) {
            if (item && typeof item.id === 'string' && known.has(item.id) && !seen.has(item.id)) {
                seen.add(item.id);
                result.push({id: item.id, isSelected: item.isSelected !== false});
            }
        }
    }
    for (const id of columnIds) if (!seen.has(id)) result.push({id, isSelected: true});
    return result;
}
