export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Для отсортированного по возрастанию таймлайна возвращает число ведущих
 * точек, которые вышли за окно `windowMs`, заканчивающееся в `latestTs`.
 * Бинарный поиск — O(log n), чтобы не сканировать десятки тысяч точек на каждом тике.
 */
export function countExpired(timeline: ArrayLike<number>, latestTs: number, windowMs: number): number {
    const cutoff = latestTs - windowMs;
    let lo = 0;
    let hi = timeline.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (timeline[mid] < cutoff) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}
