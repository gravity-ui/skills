import { describe, expect, it } from 'vitest';

import {
    type Layout,
    clampItem,
    collides,
    compact,
    findFreeSpot,
    hasOverlaps,
    placeItem,
    pushDown,
} from './layout';

const item = (i: string, x: number, y: number, w: number, h: number) => ({ i, x, y, w, h });
const pos = (layout: Layout) =>
    Object.fromEntries(layout.map((l) => [l.i, [l.x, l.y, l.w, l.h].join(',')]));

describe('collides', () => {
    it('detects overlap and ignores touching edges', () => {
        expect(collides(item('a', 0, 0, 2, 2), item('b', 1, 1, 2, 2))).toBe(true);
        expect(collides(item('a', 0, 0, 2, 2), item('b', 2, 0, 2, 2))).toBe(false);
        expect(collides(item('a', 0, 0, 2, 2), item('b', 0, 2, 2, 2))).toBe(false);
    });
});

describe('clampItem', () => {
    it('keeps the item inside the columns and within min size', () => {
        expect(clampItem({ ...item('a', 10, -3, 4, 1), minH: 2 }, 12)).toMatchObject({
            x: 8,
            y: 0,
            w: 4,
            h: 2,
        });
        expect(clampItem({ ...item('a', 0, 0, 20, 2), maxW: 6 }, 12).w).toBe(6);
    });
});

describe('compact', () => {
    it('removes vertical holes while keeping order', () => {
        const out = compact([item('a', 0, 3, 6, 2), item('b', 0, 8, 6, 2), item('c', 6, 5, 6, 1)]);
        expect(pos(out)).toEqual({ a: '0,0,6,2', b: '0,2,6,2', c: '6,0,6,1' });
    });

    it('does not hop over a blocking item', () => {
        const out = compact([item('top', 0, 0, 6, 1), item('wide', 0, 1, 12, 2), item('low', 6, 3, 6, 1)]);
        expect(out.find((l) => l.i === 'low')!.y).toBe(3);
    });
});

describe('placeItem — compact mode', () => {
    const base = [item('a', 0, 0, 12, 2), item('b', 0, 2, 12, 2)];

    it('swaps two stacked items when dragged down past the middle', () => {
        const out = placeItem(base, 'a', { y: 2 }, 12, 'compact');
        expect(pos(out)).toEqual({ a: '0,2,12,2', b: '0,0,12,2' });
        expect(hasOverlaps(out)).toBe(false);
    });

    it('swaps when dragged up', () => {
        const out = placeItem(base, 'b', { y: 0 }, 12, 'compact');
        expect(pos(out)).toEqual({ a: '0,2,12,2', b: '0,0,12,2' });
    });

    it('swaps same-row tiles instead of leaving a hole', () => {
        const row = [
            item('a', 0, 0, 3, 2),
            item('b', 3, 0, 3, 2),
            item('c', 6, 0, 3, 2),
            item('d', 9, 0, 3, 2),
            item('wide', 0, 2, 8, 4),
        ];
        const out = placeItem(row, 'a', { x: 9, y: 0 }, 12, 'compact');
        expect(pos(out)).toMatchObject({ a: '9,0,3,2', d: '0,0,3,2', wide: '0,2,8,4' });
        expect(hasOverlaps(out)).toBe(false);
    });

    it('settles back when the move is too small', () => {
        const out = placeItem(base, 'a', { y: 1 }, 12, 'compact');
        expect(pos(out)).toEqual(pos(base));
    });

    it('resizing pushes neighbours instead of overlapping them', () => {
        const side = [item('a', 0, 0, 6, 2), item('b', 6, 0, 6, 2), item('c', 0, 2, 6, 2)];
        const out = placeItem(side, 'a', { w: 8, h: 3 }, 12, 'compact');
        expect(hasOverlaps(out)).toBe(false);
        expect(out.find((l) => l.i === 'a')).toMatchObject({ x: 0, y: 0, w: 8, h: 3 });
    });

    it('is computed from the base, so the neighbours come back', () => {
        const away = placeItem(base, 'a', { y: 2 }, 12, 'compact');
        expect(pos(away)).not.toEqual(pos(base));
        const back = placeItem(base, 'a', { y: 0 }, 12, 'compact');
        expect(pos(back)).toEqual(pos(base));
    });
});

describe('placeItem — free mode', () => {
    it('keeps gaps and cascades pushes downward', () => {
        const base = [item('a', 0, 0, 4, 2), item('b', 4, 4, 4, 2), item('c', 4, 6, 4, 2)];
        const out = placeItem(base, 'a', { x: 4, y: 3 }, 12, 'free');
        expect(pos(out)).toEqual({ a: '4,3,4,2', b: '4,5,4,2', c: '4,7,4,2' });
        expect(hasOverlaps(out)).toBe(false);
    });

    it('leaves untouched items exactly where they are', () => {
        const base = [item('a', 0, 0, 4, 2), item('b', 8, 9, 4, 2)];
        expect(pos(pushDown(base, 'a'))).toEqual(pos(base));
    });
});

describe('findFreeSpot', () => {
    it('finds the first top-left hole that fits', () => {
        const layout = [item('a', 0, 0, 8, 2), item('b', 0, 2, 12, 2)];
        expect(findFreeSpot(layout, 4, 2, 12)).toEqual({ x: 8, y: 0, w: 4, h: 2 });
        expect(findFreeSpot(layout, 6, 2, 12)).toEqual({ x: 0, y: 4, w: 6, h: 2 });
    });
});

describe('random drags never produce overlaps', () => {
    it('holds for both modes', () => {
        let seed = 7;
        const rnd = (n: number) => {
            seed = (seed * 1103515245 + 12345) % 2 ** 31;
            return seed % n;
        };
        for (const mode of ['compact', 'free'] as const) {
            let layout: Layout = Array.from({ length: 8 }, (_, k) =>
                item(`w${k}`, (k % 3) * 4, Math.floor(k / 3) * 2, 4, 2),
            );
            for (let step = 0; step < 300; step++) {
                const target = layout[rnd(layout.length)];
                layout = placeItem(
                    layout,
                    target.i,
                    { x: rnd(12), y: rnd(10), w: 1 + rnd(8), h: 1 + rnd(4) },
                    12,
                    mode,
                );
                expect(hasOverlaps(layout)).toBe(false);
            }
        }
    });
});
