import type {VizDataset} from '../viz';

import {createRandom} from './random';

const DAY = 86_400_000;

/** Продажи по дням за последние 90 дней, два канала, тыс. ₽. */
export function buildSalesDataset(days = 90): VizDataset {
    const random = createRandom(42);
    const today = Math.floor(Date.now() / DAY) * DAY;
    const start = today - (days - 1) * DAY;

    const timeline: number[] = [];
    const online: number[] = [];
    const retail: number[] = [];

    for (let i = 0; i < days; i += 1) {
        const ts = start + i * DAY;
        const weekday = new Date(ts).getUTCDay();
        const weekend = weekday === 0 || weekday === 6;
        const trend = 1 + i / days / 4;

        const onlineBase = 420 * trend * (weekend ? 1.25 : 1);
        const retailBase = 310 * trend * (weekend ? 0.7 : 1);

        timeline.push(ts);
        online.push(Math.round(onlineBase + (random() - 0.5) * 120));
        retail.push(Math.round(retailBase + (random() - 0.5) * 90));
    }

    return {
        title: 'Продажи по дням',
        unit: 'тыс. ₽',
        precision: 0,
        timeline,
        series: [
            {id: 'online', name: 'Онлайн', values: online},
            {id: 'retail', name: 'Розница', values: retail},
        ],
    };
}
