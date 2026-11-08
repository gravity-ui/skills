export interface DailyPoint {
    /** Timestamp in milliseconds (datetime X axis) */
    x: number;
    /** Active users that day */
    y: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = 30;

/**
 * Deterministic sample data: daily active users for the 30 days ending today,
 * with a weekly seasonality and a mild upward trend.
 */
export function getActiveUsersSeries(now: number = Date.now()): DailyPoint[] {
    const todayUtc = Date.UTC(
        new Date(now).getUTCFullYear(),
        new Date(now).getUTCMonth(),
        new Date(now).getUTCDate(),
    );

    return Array.from({length: DAYS}, (_, i) => {
        const dayOffset = i - (DAYS - 1);
        const trend = i * 14;
        const weekly = Math.round(220 * Math.sin((i * 2 * Math.PI) / 7));
        const wave = Math.round(60 * Math.sin((i * 2 * Math.PI) / 3.5));
        return {
            x: todayUtc + dayOffset * DAY_MS,
            y: 1800 + trend + weekly + wave,
        };
    });
}
