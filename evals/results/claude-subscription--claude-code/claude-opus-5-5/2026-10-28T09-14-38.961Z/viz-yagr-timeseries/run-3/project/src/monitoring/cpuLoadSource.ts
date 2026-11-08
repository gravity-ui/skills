/** Колоночный набор точек: timeline[i] (мс) ↔ values[i] (% загрузки CPU, null — нет данных). */
export interface CpuSeries {
    timeline: number[];
    values: Array<number | null>;
}

export interface CpuLoadSource {
    /** История за последние `windowMs`, точки в порядке возрастания времени. */
    fetchHistory(windowMs: number, signal: AbortSignal): Promise<CpuSeries>;
    /** Подписка на новые точки в реальном времени. Возвращает функцию отписки. */
    subscribe(listener: (chunk: CpuSeries) => void): () => void;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Демо-источник: синтетическая загрузка CPU с суточным ритмом, шумом и редкими пиками.
 * Заменяется реальным API (REST + WebSocket/SSE) с тем же интерфейсом.
 */
export function createMockCpuLoadSource({stepMs = 2000}: {stepMs?: number} = {}): CpuLoadSource {
    let spike = 0;

    const sample = (time: number) => {
        const hour = (time / 3_600_000) % 24;
        const daily = 30 + 20 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
        if (Math.random() < 0.0015) {
            spike = 30 + Math.random() * 40;
        }
        spike *= 0.97;
        const value = daily + spike + (Math.random() - 0.5) * 12;
        return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
    };

    return {
        fetchHistory(windowMs, signal) {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    const end = Math.floor(Date.now() / stepMs) * stepMs;
                    const count = Math.floor(windowMs / stepMs);
                    const timeline = new Array<number>(count);
                    const values = new Array<number | null>(count);
                    for (let i = 0; i < count; i++) {
                        const time = end - (count - 1 - i) * stepMs;
                        timeline[i] = time;
                        values[i] = sample(time);
                    }
                    resolve({timeline, values});
                }, 300);
                signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(signal.reason);
                });
            });
        },
        subscribe(listener) {
            const timer = setInterval(() => {
                const time = Math.floor(Date.now() / stepMs) * stepMs;
                listener({timeline: [time], values: [sample(time)]});
            }, stepMs);
            return () => clearInterval(timer);
        },
    };
}
