/**
 * Pure grid-layout math. No React, no DOM — everything here is unit-tested.
 *
 * Coordinates are in grid cells: `x`/`w` are columns, `y`/`h` are rows.
 */

export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
}

export type Layout = LayoutItem[];

/** `compact` — items float up (no holes). `free` — items stay where they are put. */
export type PackMode = 'compact' | 'free';

export function collides(a: LayoutItem, b: LayoutItem): boolean {
    if (a.i === b.i) return false;
    return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function bottom(layout: Layout): number {
    return layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
}

export function sortByPosition<T extends LayoutItem>(layout: T[]): T[] {
    return [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Keeps size within min/max and the item inside the column range. */
export function clampItem<T extends LayoutItem>(item: T, cols: number): T {
    const minW = Math.min(item.minW ?? 1, cols);
    const maxW = Math.min(item.maxW ?? cols, cols);
    const w = clamp(Math.round(item.w), minW, maxW);
    const h = clamp(Math.round(item.h), item.minH ?? 1, item.maxH ?? Infinity);
    const x = clamp(Math.round(item.x), 0, cols - w);
    const y = Math.max(0, Math.round(item.y));
    return { ...item, x, y, w, h };
}

function restoreOrder<T extends LayoutItem>(original: T[], placed: T[]): T[] {
    const byId = new Map(placed.map((item) => [item.i, item]));
    return original.map((item) => byId.get(item.i) ?? item);
}

function firstFreeYBelow(item: LayoutItem, startY: number, placed: LayoutItem[]): number {
    let y = startY;
    for (;;) {
        const hit = placed.filter((p) => collides({ ...item, y }, p));
        if (hit.length === 0) return y;
        y = Math.max(...hit.map((p) => p.y + p.h));
    }
}

/**
 * Vertical gravity: every item moves up as far as it can without overlapping
 * items above it. Order is decided by current position (top-to-bottom, left-to-right).
 *
 * With `fixedId`, that item is pinned in place, and the others may "jump over"
 * it — which is what lets a dragged widget swap places with its neighbour.
 */
export function compact<T extends LayoutItem>(
    layout: T[],
    fixedId?: string,
    /** Where the pinned item came from — a displaced neighbour may take that spot (swap). */
    vacated?: Pick<LayoutItem, 'x' | 'y'>,
): T[] {
    const fixed = layout.find((item) => item.i === fixedId);
    const placed: T[] = fixed ? [fixed] : [];
    const placedNonFixed: T[] = [];

    for (const item of sortByPosition(layout)) {
        if (item === fixed) continue;

        // Gravity, ignoring the pinned item.
        let y = item.y;
        while (y > 0 && !placedNonFixed.some((p) => collides({ ...item, y: y - 1 }, p))) y--;
        y = firstFreeYBelow(item, y, placedNonFixed);

        let x = item.x;
        if (fixed && collides({ ...item, y }, fixed)) {
            // Landed on the pinned item. Preference: above it → the spot it vacated → below it.
            const fits = (cx: number, cy: number) =>
                cy >= 0 && !placed.some((p) => collides({ ...item, x: cx, y: cy }, p));
            const above = fixed.y - item.h;
            if (above >= y && fits(x, above)) {
                y = above;
            } else if (vacated && fits(vacated.x, vacated.y)) {
                x = vacated.x;
                y = vacated.y;
            } else {
                y = firstFreeYBelow(item, fixed.y + fixed.h, placed);
            }
        }

        const next = { ...item, x, y };
        placed.push(next);
        placedNonFixed.push(next);
    }

    return restoreOrder(layout, placed);
}

/**
 * Free placement: nothing floats, but whatever overlaps the pinned item is pushed
 * down, and the push cascades to whatever *that* lands on. Relative vertical order
 * of the pushed items is preserved.
 */
export function pushDown<T extends LayoutItem>(layout: T[], fixedId: string): T[] {
    const fixed = layout.find((item) => item.i === fixedId);
    if (!fixed) return layout;
    const placed: T[] = [fixed];
    for (const item of sortByPosition(layout)) {
        if (item === fixed) continue;
        const next = { ...item, y: firstFreeYBelow(item, item.y, placed) };
        placed.push(next);
    }
    return restoreOrder(layout, placed);
}

/**
 * Places `id` at the given rectangle and re-flows the others.
 * Always computed from a stable `base` layout (the one at drag start), so moving
 * the pointer back restores the neighbours to where they were.
 */
export function placeItem<T extends LayoutItem>(
    base: T[],
    id: string,
    rect: Partial<Pick<LayoutItem, 'x' | 'y' | 'w' | 'h'>>,
    cols: number,
    mode: PackMode,
): T[] {
    const original = base.find((item) => item.i === id);
    const moved = base.map((item) => (item.i === id ? clampItem({ ...item, ...rect }, cols) : item));
    if (mode === 'free') return pushDown(moved, id);
    // First pass decides who goes above/below the dragged item (or swaps into its old
    // spot when moving); second pass removes holes.
    const isMove = rect.w === undefined && rect.h === undefined;
    return compact(compact(moved, id, isMove ? original : undefined));
}

/** First top-left spot where a `w × h` block fits. */
export function findFreeSpot(layout: Layout, w: number, h: number, cols: number) {
    const width = Math.min(w, cols);
    for (let y = 0; ; y++) {
        for (let x = 0; x + width <= cols; x++) {
            const probe = { i: '__probe__', x, y, w: width, h };
            if (!layout.some((item) => collides(probe, item))) return { x, y, w: width, h };
        }
    }
}

export function layoutsEqual(a: Layout, b: Layout): boolean {
    if (a.length !== b.length) return false;
    const byId = new Map(b.map((item) => [item.i, item]));
    return a.every((item) => {
        const other = byId.get(item.i);
        return (
            other !== undefined &&
            other.x === item.x &&
            other.y === item.y &&
            other.w === item.w &&
            other.h === item.h
        );
    });
}

export function hasOverlaps(layout: Layout): boolean {
    return layout.some((a, idx) => layout.slice(idx + 1).some((b) => collides(a, b)));
}
