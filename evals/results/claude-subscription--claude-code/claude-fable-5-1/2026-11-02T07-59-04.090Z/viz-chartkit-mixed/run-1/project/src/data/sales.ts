import type {VizDataset} from '../widget';

import {createRandom} from './random';

const MONTHS = 24;
const START = Date.UTC(2024, 10, 1); // ноябрь 2024

interface Channel {
    id: string;
    name: string;
    base: number;
    growth: number;
}

const CHANNELS: Channel[] = [
    {id: 'online', name: 'Интернет-магазин', base: 4_200_000, growth: 0.035},
    {id: 'retail', name: 'Розница', base: 6_800_000, growth: 0.006},
    {id: 'wholesale', name: 'Опт', base: 3_100_000, growth: 0.015},
];

/** Сезонность: пик в декабре, провал в январе и летом. */
function seasonality(month: number): number {
    const table = [0.82, 0.88, 0.96, 1.0, 1.02, 0.95, 0.9, 0.93, 1.03, 1.08, 1.15, 1.38];
    return table[month];
}

/** Выручка по каналам за 24 месяца — обычный линейный график. */
export function createSalesDataset(): VizDataset {
    const random = createRandom(2024);
    const timeline: number[] = [];

    for (let i = 0; i < MONTHS; i++) {
        const date = new Date(START);
        date.setUTCMonth(date.getUTCMonth() + i);
        timeline.push(date.getTime());
    }

    const series = CHANNELS.map((channel) => ({
        id: channel.id,
        name: channel.name,
        values: timeline.map((ts, i) => {
            const month = new Date(ts).getUTCMonth();
            const trend = Math.pow(1 + channel.growth, i);
            const noise = 1 + (random() - 0.5) * 0.12;
            return Math.round(channel.base * trend * seasonality(month) * noise);
        }),
    }));

    return {timeline, series, unit: '₽', precision: 0};
}
