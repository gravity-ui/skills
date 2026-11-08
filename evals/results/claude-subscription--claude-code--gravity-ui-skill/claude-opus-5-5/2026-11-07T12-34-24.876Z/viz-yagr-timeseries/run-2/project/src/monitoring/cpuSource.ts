/**
 * Источник метрики загрузки CPU.
 *
 * Сейчас это симуляция: история за сутки с шагом в 1 секунду (86 400 точек)
 * и поток новых точек раз в секунду. В реальном приложении на месте
 * `createSimulatedCpuSource` будет обёртка над WebSocket / SSE / polling
 * с тем же интерфейсом `CpuMetricsSource`.
 */

export interface CpuPoints {
    /** Временные метки в миллисекундах, по возрастанию. */
    timeline: number[];
    /** Загрузка CPU в процентах (0–100), `null` — пропуск данных. */
    values: (number | null)[];
}

export interface CpuMetricsSource {
    /** Длина окна, которое держит график, в миллисекундах. */
    readonly windowMs: number;
    /** Снимок истории за окно. Возвращает новые массивы, их можно мутировать. */
    getSnapshot(): CpuPoints;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(listener: (points: CpuPoints) => void): () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

interface SimulatedSourceOptions {
    stepMs?: number;
    windowMs?: number;
}

export function createSimulatedCpuSource({
    stepMs = 1000,
    windowMs = DAY_MS,
}: SimulatedSourceOptions = {}): CpuMetricsSource {
    const listeners = new Set<(points: CpuPoints) => void>();
    let timer: ReturnType<typeof setInterval> | undefined;

    // Детерминированный ГПСЧ, чтобы картинка не прыгала между перезагрузками.
    let seed = 42;
    const random = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };

    let level = 35;
    const valueAt = (ts: number) => {
        const hour = new Date(ts).getHours() + new Date(ts).getMinutes() / 60;
        // Суточный цикл: днём выше, ночью ниже.
        const daily = 20 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
        level += (random() - 0.5) * 4 - (level - 35) * 0.01;
        const spike = random() > 0.9995 ? 40 * random() : 0;
        const value = level + daily + (random() - 0.5) * 6 + spike;
        return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
    };

    const now = Math.floor(Date.now() / stepMs) * stepMs;
    const count = Math.floor(windowMs / stepMs);
    const history: CpuPoints = {timeline: new Array(count), values: new Array(count)};
    for (let i = 0; i < count; i++) {
        const ts = now - (count - 1 - i) * stepMs;
        history.timeline[i] = ts;
        history.values[i] = valueAt(ts);
    }
    let lastTs = now;

    const tick = () => {
        const ts = lastTs + stepMs;
        lastTs = ts;
        const value = valueAt(ts);
        history.timeline.push(ts);
        history.values.push(value);
        history.timeline.shift();
        history.values.shift();
        const points: CpuPoints = {timeline: [ts], values: [value]};
        listeners.forEach((listener) => listener(points));
    };

    return {
        windowMs,
        getSnapshot: () => ({
            timeline: history.timeline.slice(),
            values: history.values.slice(),
        }),
        subscribe(listener) {
            listeners.add(listener);
            if (!timer) {
                timer = setInterval(tick, stepMs);
            }
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0 && timer) {
                    clearInterval(timer);
                    timer = undefined;
                }
            };
        },
    };
}
