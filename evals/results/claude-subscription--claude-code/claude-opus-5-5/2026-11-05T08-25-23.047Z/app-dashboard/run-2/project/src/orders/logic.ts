import { STATUS_ORDER, type Order, type OrderStatus } from './data';

/**
 * Переносит элемент с позиции `from` так, чтобы он оказался перед элементом,
 * который до переноса стоял на позиции `insertBefore` (`list.length` — в конец).
 */
export function moveItem<T>(list: readonly T[], from: number, insertBefore: number): T[] {
    if (from < 0 || from >= list.length) return list.slice();
    const target = Math.max(0, Math.min(insertBefore, list.length));
    const result = list.slice();
    const [item] = result.splice(from, 1);
    result.splice(target > from ? target - 1 : target, 0, item);
    return result;
}

/**
 * Приводит сохранённый порядок колонок к актуальному набору: неизвестные id
 * выбрасываются, новые колонки дописываются в конец в порядке по умолчанию.
 */
export function sanitizeOrder<T extends string>(saved: unknown, defaults: readonly T[]): T[] {
    if (!Array.isArray(saved)) return defaults.slice();
    const known = new Set<string>(defaults);
    const seen = new Set<string>();
    const result: T[] = [];
    for (const id of saved) {
        if (typeof id === 'string' && known.has(id) && !seen.has(id)) {
            seen.add(id);
            result.push(id as T);
        }
    }
    for (const id of defaults) if (!seen.has(id)) result.push(id);
    return result;
}

export type TableRow =
    | { kind: 'group'; status: OrderStatus; orders: Order[]; total: number; collapsed: boolean }
    | { kind: 'order'; order: Order };

/**
 * Плоский список строк для рендера. При группировке перед заказами каждого
 * статуса идёт строка-заголовок; заказы свёрнутых групп не попадают в список.
 * Пустые группы не показываются. Порядок заказов внутри группы сохраняется.
 */
export function buildRows(orders: readonly Order[], grouped: boolean, collapsed: ReadonlySet<OrderStatus>): TableRow[] {
    if (!grouped) return orders.map((order) => ({ kind: 'order', order }));

    const byStatus = new Map<OrderStatus, Order[]>();
    for (const order of orders) {
        const bucket = byStatus.get(order.status);
        if (bucket) bucket.push(order);
        else byStatus.set(order.status, [order]);
    }

    const rows: TableRow[] = [];
    for (const status of STATUS_ORDER) {
        const groupOrders = byStatus.get(status);
        if (!groupOrders) continue;
        const isCollapsed = collapsed.has(status);
        rows.push({
            kind: 'group',
            status,
            orders: groupOrders,
            total: groupOrders.reduce((sum, o) => sum + o.total, 0),
            collapsed: isCollapsed,
        });
        if (!isCollapsed) for (const order of groupOrders) rows.push({ kind: 'order', order });
    }
    return rows;
}

export type CheckState = 'all' | 'some' | 'none';

export function checkState(ids: readonly string[], selected: ReadonlySet<string>): CheckState {
    let count = 0;
    for (const id of ids) if (selected.has(id)) count++;
    if (count === 0) return 'none';
    return count === ids.length ? 'all' : 'some';
}

/** Выставляет `value` всем `ids`. Возвращает тот же Set, если ничего не изменилось. */
export function setMany(selected: ReadonlySet<string>, ids: readonly string[], value: boolean): ReadonlySet<string> {
    const next = new Set(selected);
    for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
    }
    return next.size === selected.size && ids.every((id) => selected.has(id) === value) ? selected : next;
}

/**
 * Ids между якорем и целевой строкой включительно — для выделения диапазона
 * по Shift+клику. Если якоря нет среди видимых строк, диапазон — одна строка.
 */
export function rangeIds(visibleIds: readonly string[], anchorId: string | null, targetId: string): string[] {
    const to = visibleIds.indexOf(targetId);
    if (to === -1) return [];
    const from = anchorId === null ? -1 : visibleIds.indexOf(anchorId);
    if (from === -1) return [targetId];
    const [start, end] = from <= to ? [from, to] : [to, from];
    return visibleIds.slice(start, end + 1);
}
