import {describe, expect, it} from 'vitest';

import {PendingSamples, lowerBound, trimToWindow, upperBound} from './series';

describe('lowerBound / upperBound', () => {
    const sorted = [10, 20, 20, 30];

    it('find insertion points', () => {
        expect(lowerBound(sorted, 5)).toBe(0);
        expect(lowerBound(sorted, 20)).toBe(1);
        expect(upperBound(sorted, 20)).toBe(3);
        expect(lowerBound(sorted, 35)).toBe(4);
        expect(upperBound([], 1)).toBe(0);
    });
});

describe('PendingSamples', () => {
    it('drops samples that are not newer than the latest accepted one', () => {
        const pending = new PendingSamples(1000);
        pending.push({timestamps: [1, 2, 3], values: [10, 20, 30]});
        pending.push({timestamps: [3, 2, 4], values: [31, 21, 40]});

        expect(pending.take(-Infinity)).toEqual({timestamps: [1, 2, 3, 4], values: [10, 20, 30, 40]});
        expect(pending.size).toBe(0);
    });

    it('returns only samples newer than the drawn ones', () => {
        const pending = new PendingSamples(1000);
        pending.push({timestamps: [1, 2, 3], values: [10, null, 30]});

        expect(pending.take(2)).toEqual({timestamps: [3], values: [30]});
    });

    it('keeps memory bounded by the window', () => {
        const pending = new PendingSamples(10);
        for (let t = 0; t < 100; t++) {
            pending.push({timestamps: [t], values: [t]});
        }

        expect(pending.take(-Infinity).timestamps).toEqual([89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
    });
});

describe('trimToWindow', () => {
    it('keeps the window relative to the newest point', () => {
        const series = {timestamps: [0, 5, 10, 15], values: [1, 2, 3, 4]};

        expect(trimToWindow(series, 10)).toEqual({timestamps: [5, 10, 15], values: [2, 3, 4]});
        expect(trimToWindow(series, 100)).toBe(series);
    });
});
