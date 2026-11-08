/**
 * Источник данных о загрузке CPU.
 *
 * Интерфейс отделён от реализации: в проде сюда подставляется реальный
 * транспорт (WebSocket / SSE / polling), для разработки используется mock‑стрим.
 */

export interface CpuLoadSample {
    /** Unix‑время в миллисекундах */
    ts: number;
    /** Загрузка CPU, % (0–100) */
    value: number;
}

export interface CpuLoadHistory {
    /** Unix‑время каждой точки, мс, по возрастанию */
    timeline: number[];
    /** Загрузка CPU, %, по одной на точку timeline */
    values: number[];
}

export interface CpuLoadSource {
    /** История за последние `windowMs` миллисекунд. */
    loadHistory(windowMs: number): Promise<CpuLoadHistory>;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(listener: (samples: CpuLoadSample[]) => void): () => void;
}

/** Окно графика: последние сутки */
export const CPU_LOAD_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Шаг между точками: 1 с → 86 400 точек в окне */
export const CPU_LOAD_SAMPLE_INTERVAL_MS = 1000;

/**
 * Mock‑источник: правдоподобный суточный профиль нагрузки + случайное блуждание
 * и редкие всплески. Новая точка приходит каждые `intervalMs`.
 */
export function createMockCpuLoadSource(intervalMs = CPU_LOAD_SAMPLE_INTERVAL_MS): CpuLoadSource {
    let drift = 0;
    let spikeLeft = 0;

    const clamp = (v: number) => Math.min(100, Math.max(0, v));

    const next = (ts: number): number => {
        const hour = new Date(ts).getHours() + new Date(ts).getMinutes() / 60;
        // дневной горб с пиком около 15:00
        const daily = 35 + 25 * Math.sin(((hour - 9) / 24) * Math.PI * 2);
        drift = clamp(drift + (Math.random() - 0.5) * 1.2) * 0.98;
        if (spikeLeft > 0) {
            spikeLeft -= 1;
        } else if (Math.random() < 0.0008) {
            spikeLeft = 20 + Math.floor(Math.random() * 60);
        }
        const spike = spikeLeft > 0 ? 25 + Math.random() * 10 : 0;
        const noise = (Math.random() - 0.5) * 6;
        return Math.round(clamp(daily + drift + spike + noise) * 10) / 10;
    };

    return {
        loadHistory(windowMs) {
            const count = Math.floor(windowMs / intervalMs);
            const end = Math.floor(Date.now() / intervalMs) * intervalMs;
            const timeline = new Array<number>(count);
            const values = new Array<number>(count);
            for (let i = 0; i < count; i++) {
                const ts = end - (count - 1 - i) * intervalMs;
                timeline[i] = ts;
                values[i] = next(ts);
            }
            return Promise.resolve({timeline, values});
        },
        subscribe(listener) {
            const timer = window.setInterval(() => {
                const ts = Date.now();
                listener([{ts, value: next(ts)}]);
            }, intervalMs);
            return () => window.clearInterval(timer);
        },
    };
}
