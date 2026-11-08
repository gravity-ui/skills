import {describe, expect, it} from 'vitest';

import {DEFAULT_CONFIG, WIDGET_CATALOG} from './catalog';

const GRID_COLUMNS = 36;

describe('DEFAULT_CONFIG', () => {
    it('places every item exactly once and references no unknown ids', () => {
        const itemIds = DEFAULT_CONFIG.items.map((item) => item.id);
        const layoutIds = DEFAULT_CONFIG.layout.map((layout) => layout.i);

        expect(new Set(itemIds).size).toBe(itemIds.length);
        expect(layoutIds.sort()).toEqual([...itemIds].sort());
    });

    it('uses only widget types that are registered in the catalog or built in', () => {
        const known = new Set(['title', ...WIDGET_CATALOG.map((entry) => entry.type)]);
        for (const item of DEFAULT_CONFIG.items) {
            expect(known.has(item.type), `unknown type "${item.type}"`).toBe(true);
        }
    });

    it('keeps every widget inside the grid', () => {
        for (const layout of DEFAULT_CONFIG.layout) {
            expect(layout.x).toBeGreaterThanOrEqual(0);
            expect(layout.y).toBeGreaterThanOrEqual(0);
            expect(layout.x + layout.w, `${layout.i} overflows the grid`).toBeLessThanOrEqual(GRID_COLUMNS);
        }
    });

    it('has no overlapping widgets', () => {
        const rects = DEFAULT_CONFIG.layout;
        for (let a = 0; a < rects.length; a++) {
            for (let b = a + 1; b < rects.length; b++) {
                const p = rects[a];
                const q = rects[b];
                const overlaps =
                    p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
                expect(overlaps, `${p.i} overlaps ${q.i}`).toBe(false);
            }
        }
    });
});
