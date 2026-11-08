import {DAY_MS} from './cpuLoad';
import type {CpuLoadSource, TimeSeries} from './cpuLoad';

interface MockOptions {
    /** Шаг между точками, мс. При 2 с за сутки набирается 43 200 точек. */
    stepMs?: number;
    /** Имитация задержки сети при загрузке истории, мс. */
    latencyMs?: number;
}

/** Детерминированный шум в [0, 1) по номеру точки: история и живые данные согласованы. */
function hash(n: number): number {
    let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
}

function cpuLoadAt(ts: number, stepMs: number): number {
    const hours = ts / 3_600_000;
    const daily = 18 * Math.sin(((hours - 9) / 24) * 2 * Math.PI);
    const drift = 6 * Math.sin(hours * 1.7) + 4 * Math.sin(hours * 5.3 + 1);
    const jitter = (hash(Math.floor(ts / stepMs)) - 0.5) * 10;
    // Редкие всплески длиной около пары минут, как от cron-задач или сборки мусора.
    const burst = hash(Math.floor(ts / 120_000) + 7) > 0.985 ? 35 : 0;
    const value = 32 + daily + drift + jitter + burst;
    return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

export function createMockCpuLoadSource({stepMs = 2000, latencyMs = 400}: MockOptions = {}): CpuLoadSource {
    const align = (ts: number) => Math.floor(ts / stepMs) * stepMs;

    return {
        fetchHistory({from, to}, signal) {
            return new Promise<TimeSeries>((resolve, reject) => {
                const abortError = () => new DOMException('History request aborted', 'AbortError');
                if (signal.aborted) {
                    reject(abortError());
                    return;
                }
                const timer = setTimeout(() => {
                    signal.removeEventListener('abort', onAbort);
                    const timestamps: number[] = [];
                    const values: number[] = [];
                    for (let ts = align(from) + stepMs; ts <= to; ts += stepMs) {
                        timestamps.push(ts);
                        values.push(cpuLoadAt(ts, stepMs));
                    }
                    resolve({timestamps, values});
                }, latencyMs);
                const onAbort = () => {
                    clearTimeout(timer);
                    reject(abortError());
                };
                signal.addEventListener('abort', onAbort, {once: true});
            });
        },

        subscribe(listener) {
            let last = align(Date.now());
            const timer = setInterval(() => {
                const ts = align(Date.now());
                if (ts <= last) {
                    return;
                }
                const timestamps: number[] = [];
                const values: number[] = [];
                // Если вкладка «спала» и таймер пропустил тики, досылаем пропущенное,
                // но не больше суток: более старые точки график всё равно отрежет.
                for (let t = Math.max(last, align(ts - DAY_MS)) + stepMs; t <= ts; t += stepMs) {
                    timestamps.push(t);
                    values.push(cpuLoadAt(t, stepMs));
                }
                last = ts;
                listener({timestamps, values});
            }, stepMs);

            return () => clearInterval(timer);
        },
    };
}
