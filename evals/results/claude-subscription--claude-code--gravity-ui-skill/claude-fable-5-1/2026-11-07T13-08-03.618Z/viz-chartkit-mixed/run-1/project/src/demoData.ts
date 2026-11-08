import type {VizDataset} from './viz-widget';

/** Детерминированный генератор, чтобы демо-данные были стабильны между рендерами. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const DAY = 24 * 60 * 60 * 1000;

/** Продажи: 24 месяца, два канала, значения в тысячах рублей. */
export function buildSalesDataset(): VizDataset {
    const rand = mulberry32(7);
    const timeline: number[] = [];
    const online: number[] = [];
    const retail: number[] = [];

    for (let month = 0; month < 24; month += 1) {
        const date = Date.UTC(2024, month, 1);
        timeline.push(date);
        const season = 1 + 0.25 * Math.sin(((month % 12) / 12) * Math.PI * 2 - Math.PI / 2);
        online.push(Math.round((1800 + month * 65) * season + rand() * 250));
        retail.push(Math.round((2600 - month * 20) * season + rand() * 300));
    }

    return {
        title: 'Выручка по каналам продаж',
        timeline,
        valueTitle: 'тыс. ₽',
        precision: 0,
        series: [
            {id: 'online', name: 'Онлайн', values: online},
            {id: 'retail', name: 'Розница', values: retail},
        ],
    };
}

/** Мониторинг: последние 24 часа с шагом 30 секунд (2880 точек), три метрики в процентах. */
export function buildMonitoringDataset(): VizDataset {
    const rand = mulberry32(42);
    const stepMs = 30 * 1000;
    const pointsCount = DAY / stepMs;
    const start = Date.UTC(2026, 10, 6, 12, 0, 0);

    const timeline: number[] = [];
    const cpu: Array<number | null> = [];
    const memory: Array<number | null> = [];
    const network: Array<number | null> = [];

    let cpuLevel = 42;
    let memoryLevel = 61;
    for (let i = 0; i < pointsCount; i += 1) {
        timeline.push(start + i * stepMs);
        const hour = (i * stepMs) / (60 * 60 * 1000);
        const daily = 1 + 0.3 * Math.sin((hour / 24) * Math.PI * 2);

        cpuLevel = Math.min(98, Math.max(5, cpuLevel + (rand() - 0.5) * 6));
        const spike = rand() > 0.995 ? 25 : 0;
        cpu.push(Number(Math.min(100, cpuLevel * daily + spike).toFixed(1)));

        memoryLevel = Math.min(95, Math.max(40, memoryLevel + (rand() - 0.5) * 0.8));
        memory.push(Number(memoryLevel.toFixed(1)));

        // Короткий разрыв в данных сети, чтобы было видно обработку null.
        const gap = i > 1500 && i < 1520;
        network.push(gap ? null : Number((20 * daily + rand() * 15).toFixed(1)));
    }

    return {
        title: 'Нагрузка кластера за 24 часа',
        timeline,
        valueTitle: '%',
        precision: 1,
        series: [
            {id: 'cpu', name: 'CPU', values: cpu},
            {id: 'memory', name: 'Память', values: memory},
            {id: 'network', name: 'Сеть', values: network},
        ],
    };
}
