/**
 * Источник метрик загрузки CPU.
 *
 * Хранит скользящее окно последних `windowMs` миллисекунд и отдаёт подписчикам
 * новые точки по мере поступления. В реальном приложении реализацией интерфейса
 * будет WebSocket/SSE-клиент; здесь используется симулятор с тем же контрактом.
 */

export interface CpuSample {
    /** Unix-время в миллисекундах */
    time: number;
    /** Загрузка CPU, 0–100 % */
    value: number;
}

export interface CpuSnapshot {
    /** Отсортированные по возрастанию метки времени (мс) */
    timeline: number[];
    /** Значения, индексы совпадают с `timeline` */
    values: number[];
}

export type CpuListener = (samples: readonly CpuSample[]) => void;

export interface CpuMetricsSource {
    /** Период между точками, мс */
    readonly intervalMs: number;
    /** Длина окна, мс */
    readonly windowMs: number;
    /** Копия текущего окна. Возвращает новые массивы — потребитель может их мутировать. */
    getSnapshot(): CpuSnapshot;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(listener: CpuListener): () => void;
    /** Останавливает поток данных и очищает подписки */
    stop(): void;
}

export interface SimulatedCpuMetricsOptions {
    /** Длина окна, мс (по умолчанию 24 часа) */
    windowMs?: number;
    /** Период между точками, мс (по умолчанию 2 с → 43 200 точек за сутки) */
    intervalMs?: number;
    /** Источник текущего времени, нужен для тестов */
    now?: () => number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Детерминированный генератор с состоянием: суточная волна + случайное блуждание + редкие всплески */
function createLoadGenerator() {
    let walk = 0;
    let spike = 0;

    return (time: number): number => {
        const hourOfDay = (time % DAY) / HOUR;
        // Пик нагрузки около 14:00, минимум ночью
        const daily = 38 + 18 * Math.sin(((hourOfDay - 8) / 24) * 2 * Math.PI);

        walk = walk * 0.985 + (Math.random() - 0.5) * 2.4;

        if (spike > 0.5) {
            spike *= 0.93;
        } else if (Math.random() < 0.0015) {
            spike = 25 + Math.random() * 30;
        } else {
            spike = 0;
        }

        const jitter = (Math.random() - 0.5) * 2;
        const value = daily + walk + spike + jitter;
        return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
    };
}

export function createSimulatedCpuMetrics(options: SimulatedCpuMetricsOptions = {}): CpuMetricsSource {
    const windowMs = options.windowMs ?? DAY;
    const intervalMs = options.intervalMs ?? 2_000;
    const now = options.now ?? Date.now;

    const nextValue = createLoadGenerator();
    const timeline: number[] = [];
    const values: number[] = [];
    const listeners = new Set<CpuListener>();

    // История: ровно `windowMs / intervalMs` точек, выровненных по сетке интервала
    const end = Math.floor(now() / intervalMs) * intervalMs;
    const count = Math.floor(windowMs / intervalMs);
    for (let i = count - 1; i >= 0; i--) {
        const t = end - i * intervalMs;
        timeline.push(t);
        values.push(nextValue(t));
    }

    let lastTime = end;

    const tick = () => {
        // Если вкладка «спала», догоняем все пропущенные интервалы разом
        const target = Math.floor(now() / intervalMs) * intervalMs;
        if (target <= lastTime) {
            return;
        }
        const fresh: CpuSample[] = [];
        for (let t = lastTime + intervalMs; t <= target; t += intervalMs) {
            const sample = {time: t, value: nextValue(t)};
            fresh.push(sample);
            timeline.push(t);
            values.push(sample.value);
        }
        lastTime = target;

        const minTime = target - windowMs;
        let drop = 0;
        while (drop < timeline.length && timeline[drop] <= minTime) {
            drop++;
        }
        if (drop > 0) {
            timeline.splice(0, drop);
            values.splice(0, drop);
        }

        listeners.forEach((listener) => listener(fresh));
    };

    const timer = setInterval(tick, intervalMs);

    return {
        intervalMs,
        windowMs,
        getSnapshot: () => ({timeline: timeline.slice(), values: values.slice()}),
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        stop: () => {
            clearInterval(timer);
            listeners.clear();
        },
    };
}
