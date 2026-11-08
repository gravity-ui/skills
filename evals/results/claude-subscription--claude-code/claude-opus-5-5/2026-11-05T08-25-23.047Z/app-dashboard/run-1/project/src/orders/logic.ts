import { STATUSES, type Order, type OrderStatus } from './data';

export type OrderRow = { kind: 'order'; id: string; order: Order };
export type GroupRow = { kind: 'group'; id: string; status: OrderStatus; orders: Order[]; total: number };
export type Row = OrderRow | GroupRow;

export const groupRowId = (status: OrderStatus) => `group:${status}`;

/**
 * Превращает список заказов в строки таблицы.
 * При группировке перед заказами каждого статуса вставляется строка-заголовок группы;
 * заказы свёрнутых групп в строки не попадают. Пустые группы не показываются.
 */
export function buildRows(orders: Order[], grouped: boolean, collapsed: ReadonlySet<OrderStatus>): Row[] {
    if (!grouped) {
        return orders.map((order) => ({ kind: 'order', id: order.id, order }));
    }
    const byStatus = new Map<OrderStatus, Order[]>();
    for (const order of orders) {
        const list = byStatus.get(order.status);
        if (list) list.push(order);
        else byStatus.set(order.status, [order]);
    }
    const rows: Row[] = [];
    for (const status of STATUSES) {
        const list = byStatus.get(status);
        if (!list?.length) continue;
        rows.push({
            kind: 'group',
            id: groupRowId(status),
            status,
            orders: list,
            total: list.reduce((sum, o) => sum + o.amount, 0),
        });
        if (!collapsed.has(status)) {
            for (const order of list) rows.push({ kind: 'order', id: order.id, order });
        }
    }
    return rows;
}

export type CheckState = { checked: boolean; indeterminate: boolean };

/** Состояние «общего» чекбокса для набора заказов (шапка таблицы или заголовок группы). */
export function getCheckState(ids: readonly string[], selected: ReadonlySet<string>): CheckState {
    if (ids.length === 0) return { checked: false, indeterminate: false };
    let count = 0;
    for (const id of ids) if (selected.has(id)) count++;
    return { checked: count === ids.length, indeterminate: count > 0 && count < ids.length };
}

export function setSelected(selected: ReadonlySet<string>, ids: readonly string[], value: boolean): Set<string> {
    const next = new Set(selected);
    for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
    }
    return next;
}

/** Id заказов между `anchorId` и `targetId` включительно в порядке отображения. */
export function getRange(visibleIds: readonly string[], anchorId: string, targetId: string): string[] {
    const a = visibleIds.indexOf(anchorId);
    const b = visibleIds.indexOf(targetId);
    if (a === -1 || b === -1) return [targetId];
    return visibleIds.slice(Math.min(a, b), Math.max(a, b) + 1);
}

/** Переставляет колонку `fromId` перед/после `toId`. */
export function moveColumn<T extends string>(order: readonly T[], fromId: T, toId: T, side: 'before' | 'after'): T[] {
    if (fromId === toId) return [...order];
    const rest = order.filter((id) => id !== fromId);
    const targetIndex = rest.indexOf(toId);
    if (targetIndex === -1 || !order.includes(fromId)) return [...order];
    rest.splice(side === 'before' ? targetIndex : targetIndex + 1, 0, fromId);
    return rest;
}

/** Сдвигает колонку на одну позицию среди видимых колонок (для клавиатуры). */
export function shiftColumn<T extends string>(order: readonly T[], visible: readonly T[], id: T, delta: -1 | 1): T[] {
    const i = visible.indexOf(id);
    const neighbour = visible[i + delta];
    if (i === -1 || neighbour === undefined) return [...order];
    return moveColumn(order, id, neighbour, delta < 0 ? 'before' : 'after');
}

/** Приводит сохранённый порядок колонок к актуальному набору: убирает неизвестные, дописывает новые. */
export function normalizeColumnOrder<T extends string>(saved: unknown, all: readonly T[]): T[] {
    const known = Array.isArray(saved) ? saved.filter((id): id is T => all.includes(id)) : [];
    const unique = [...new Set(known)];
    return [...unique, ...all.filter((id) => !unique.includes(id))];
}

export function matchesQuery(order: Order, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [order.id, order.customer, order.email, order.city, order.manager].some((v) => v.toLowerCase().includes(q));
}
