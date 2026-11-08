import type {VizDataset} from '../widget';

import {createRandom} from './random';

const STEP_MS = 1000;
const DURATION_MS = 2 * 60 * 60 * 1000; // два часа по секундам
const END = Date.UTC(2026, 10, 2, 9, 0, 0); // 2 ноября 2026, 12:00 по Москве

interface Host {
    id: string;
    name: string;
    base: number;
}

const HOSTS: Host[] = [
    {id: 'api-01', name: 'api-01', base: 1180},
    {id: 'api-02', name: 'api-02', base: 1120},
    {id: 'api-03', name: 'api-03', base: 1040},
    {id: 'api-04', name: 'api-04', base: 960},
];

/** Запросов в секунду по хостам API: 7200 точек на серию — плотный ряд мониторинга. */
export function createMonitoringDataset(): VizDataset {
    const random = createRandom(7);
    const count = DURATION_MS / STEP_MS;
    const start = END - DURATION_MS;
    const timeline = Array.from({length: count + 1}, (_, i) => start + i * STEP_MS);

    const incidentStart = Math.floor(count * 0.68);
    const incidentEnd = incidentStart + 240; // 4 минуты всплеска
    const restartStart = Math.floor(count * 0.3);
    const restartEnd = restartStart + 45; // 45 секунд без данных на одном хосте

    const series = HOSTS.map((host, hostIndex) => {
        let level = host.base;
        const values = timeline.map((ts, i) => {
            // Медленный дрейф + секундный шум + суточная волна.
            const hour = (ts / 3_600_000) % 24;
            const wave = 1 + 0.08 * Math.sin(((hour - 6) / 24) * Math.PI * 2);
            level += (random() - 0.5) * 6;
            level += (host.base - level) * 0.01;
            let value = level * wave + (random() - 0.5) * 40;

            if (i >= incidentStart && i < incidentEnd) {
                const t = (i - incidentStart) / (incidentEnd - incidentStart);
                value *= 1 + 0.9 * Math.sin(t * Math.PI) * (hostIndex === 0 ? 1.4 : 1);
            }
            if (hostIndex === 2 && i >= restartStart && i < restartEnd) {
                return null;
            }
            return Math.max(0, Math.round(value));
        });
        return {id: host.id, name: host.name, values};
    });

    return {timeline, series, unit: 'req/s', precision: 0, timeZone: 'Europe/Moscow'};
}
