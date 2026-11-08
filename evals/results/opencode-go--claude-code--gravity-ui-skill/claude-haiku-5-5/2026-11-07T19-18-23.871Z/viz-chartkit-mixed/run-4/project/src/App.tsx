import {useMemo} from 'react';

import {VisualizationWidget} from './widget/VisualizationWidget';
import type {WidgetSeries} from './widget/types';

const START = Date.UTC(2026, 10, 6, 0, 0); // 2026-11-06 00:00 UTC
const MINUTE = 60_000;
const POINTS = 24 * 60; // one day at minute resolution

/** Deterministic demo data: two regions, one minute per point, with a few gaps. */
function makeSampleSeries(): WidgetSeries[] {
    const make = (id: string, name: string, base: number, gap: [number, number] | null): WidgetSeries => ({
        id,
        name,
        points: Array.from({length: POINTS}, (_, i) => {
            const v = base + 20 * Math.sin((i / 240) * Math.PI * 2) + 6 * Math.sin(i / 37);
            const inGap = gap !== null && i >= gap[0] && i < gap[1];
            return {t: START + i * MINUTE, v: inGap ? null : Math.round(v * 10) / 10};
        }),
    });

    return [make('msk', 'Москва', 120, null), make('spb', 'Санкт-Петербург', 80, [600, 640])];
}

export function App() {
    const series = useMemo(makeSampleSeries, []);

    return (
        <div style={{padding: 24}}>
            <VisualizationWidget title="Выручка по регионам, руб." series={series} height={360} />
        </div>
    );
}
