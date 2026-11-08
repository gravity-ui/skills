/**
 * Источник данных загрузки CPU.
 *
 * `CpuLoadSource` — контракт, под который можно подставить реальный транспорт
 * (WebSocket, SSE, polling). Ниже — симулятор, который генерирует историю за
 * окно `windowMs` с шагом `stepMs` и затем выдаёт новые точки в реальном времени.
 */

export interface CpuLoadPoint {
    /** Unix-время, мс */
    timestamp: number;
    /** Загрузка CPU, % (0..100) */
    value: number;
}

export interface CpuLoadHistory {
    /** Отсортированные по возрастанию метки времени, мс */
    timeline: number[];
    /** Значения, параллельные `timeline` */
    values: number[];
}

export interface CpuLoadSource {
    /** Снимок истории за окно источника (последние сутки по умолчанию). */
    getHistory(): CpuLoadHistory;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(listener: (point: CpuLoadPoint) => void): () => void;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export interface SimulatedCpuLoadSourceOptions {
    /** Глубина истории, мс (по умолчанию — сутки) */
    windowMs?: number;
    /** Шаг между точками, мс (по умолчанию 2 с → 43 200 точек в сутках) */
    stepMs?: number;
}

export function createSimulatedCpuLoadSource({
    windowMs = DAY_MS,
    stepMs = 2000,
}: SimulatedCpuLoadSourceOptions = {}): CpuLoadSource {
    const listeners = new Set<(point: CpuLoadPoint) => void>();
    let timer: ReturnType<typeof setInterval> | undefined;

    // Состояние генератора: плавный случайный дрейф поверх суточного профиля.
    let drift = 0;
    let spike = 0;
    let lastTimestamp = Math.floor(Date.now() / stepMs) * stepMs;

    const next = (timestamp: number): number => {
        const hour = (timestamp % DAY_MS) / (60 * 60 * 1000);
        const daily = 35 + 20 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
        drift = Math.max(-15, Math.min(15, drift + (Math.random() - 0.5) * 2));
        if (spike > 0) {
            spike *= 0.9;
        } else if (Math.random() < 0.004) {
            spike = 25 + Math.random() * 30;
        }
        const noise = (Math.random() - 0.5) * 6;
        return Math.max(0, Math.min(100, daily + drift + spike + noise));
    };

    const getHistory = (): CpuLoadHistory => {
        const count = Math.floor(windowMs / stepMs);
        const timeline = new Array<number>(count);
        const values = new Array<number>(count);
        const start = lastTimestamp - (count - 1) * stepMs;
        for (let i = 0; i < count; i++) {
            const ts = start + i * stepMs;
            timeline[i] = ts;
            values[i] = next(ts);
        }
        return {timeline, values};
    };

    const tick = () => {
        const now = Date.now();
        // Догоняем сетку шагов, если вкладка была в фоне и таймер «проспал».
        while (lastTimestamp + stepMs <= now) {
            lastTimestamp += stepMs;
            const point: CpuLoadPoint = {timestamp: lastTimestamp, value: next(lastTimestamp)};
            listeners.forEach((listener) => listener(point));
        }
    };

    const subscribe = (listener: (point: CpuLoadPoint) => void) => {
        listeners.add(listener);
        if (timer === undefined) {
            timer = setInterval(tick, stepMs);
        }
        return () => {
            listeners.delete(listener);
            if (listeners.size === 0 && timer !== undefined) {
                clearInterval(timer);
                timer = undefined;
            }
        };
    };

    return {getHistory, subscribe};
}
