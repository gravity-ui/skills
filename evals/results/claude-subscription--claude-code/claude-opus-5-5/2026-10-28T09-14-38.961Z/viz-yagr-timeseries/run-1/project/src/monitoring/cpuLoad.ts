export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Колоночное представление ряда. Именно в таком виде данные нужны uPlot,
 * поэтому точки не приходится перекладывать из объектов в массивы.
 */
export interface TimeSeries {
    /** Метки времени в миллисекундах, строго по возрастанию. */
    timestamps: number[];
    /** Загрузка CPU в процентах; `null` — пропуск (данных за этот момент нет). */
    values: (number | null)[];
}

export interface CpuLoadSource {
    /** История за интервал `[from, to]`, отсортированная по времени. */
    fetchHistory(range: {from: number; to: number}, signal: AbortSignal): Promise<TimeSeries>;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(listener: (update: TimeSeries) => void): () => void;
}

export interface CpuLoadStats {
    current: number | null;
    average: number | null;
    peak: number | null;
}

export const EMPTY_STATS: CpuLoadStats = {current: null, average: null, peak: null};

export function createTimeSeries(): TimeSeries {
    return {timestamps: [], values: []};
}

/**
 * Дописывает `incoming` в конец `target` и отрезает всё, что старше `windowMs`
 * от последней точки. Массивы `target` меняются на месте: на них ссылается график,
 * и копировать десятки тысяч точек на каждое обновление незачем.
 *
 * Точки не новее последней в `target` отбрасываются: ось X обязана возрастать,
 * а при переподключении источник может прислать повторы.
 *
 * @returns `true`, если ряд изменился.
 */
export function appendToWindow(target: TimeSeries, incoming: TimeSeries, windowMs: number): boolean {
    const {timestamps, values} = target;
    let last = timestamps.length ? timestamps[timestamps.length - 1] : -Infinity;
    let appended = 0;

    for (let i = 0; i < incoming.timestamps.length; i++) {
        const ts = incoming.timestamps[i];
        if (!(ts > last)) {
            continue;
        }
        timestamps.push(ts);
        values.push(incoming.values[i] ?? null);
        last = ts;
        appended++;
    }

    if (!appended) {
        return false;
    }

    const from = last - windowMs;
    let drop = 0;
    while (drop < timestamps.length && timestamps[drop] < from) {
        drop++;
    }
    if (drop) {
        timestamps.splice(0, drop);
        values.splice(0, drop);
    }

    return true;
}

export function computeStats(values: (number | null)[]): CpuLoadStats {
    let current: number | null = null;
    let sum = 0;
    let count = 0;
    let peak = -Infinity;

    for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value === null) {
            continue;
        }
        current = value;
        sum += value;
        count++;
        if (value > peak) {
            peak = value;
        }
    }

    return count
        ? {current, average: sum / count, peak}
        : EMPTY_STATS;
}
