import {useId, useMemo} from 'react';
import Yagr from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';

import '@gravity-ui/yagr/index.css';

import type {EngineProps, WidgetSeries} from '../types';

/**
 * Yagr needs one shared timeline. Build the sorted union of all timestamps
 * and map each series onto it, using `null` where a series has no sample.
 */
function alignToTimeline(series: WidgetSeries[]) {
    const stamps = new Set<number>();
    const maps = series.map((s) => {
        const byTime = new Map<number, number | null>();
        for (const p of s.points) {
            stamps.add(p.t);
            byTime.set(p.t, p.v);
        }
        return byTime;
    });

    const timeline = [...stamps].sort((a, b) => a - b);
    const columns = maps.map((byTime) => timeline.map((t) => byTime.get(t) ?? null));
    return {timeline, columns};
}

/**
 * Engine for `monitoring` mode: dense time series on @gravity-ui/yagr (canvas, uPlot).
 * Loaded lazily by the widget, so this module and yagr are fetched only when the mode is shown.
 */
export default function MonitoringTimeSeries({series, colors, theme}: EngineProps) {
    // React ids contain colons; yagr uses the value as a DOM id, so normalize it.
    const id = `yagr-${useId().replace(/:/g, '')}`;

    const config = useMemo<MinimalValidConfig>(() => {
        const {timeline, columns} = alignToTimeline(series);
        return {
            timeline,
            series: series.map((s, i) => ({
                id: s.id,
                name: s.name,
                type: 'line',
                color: colors[i],
                data: columns[i],
            })),
            chart: {
                appearance: {theme: theme === 'dark' ? 'dark' : 'light'},
                // Timestamps are epoch milliseconds.
                timeMultiplier: 1,
            },
            scales: {x: {time: true}},
            legend: {show: series.length > 1},
        };
    }, [series, colors, theme]);

    return (
        <div style={{height: '100%', width: '100%'}}>
            <Yagr id={id} config={config} />
        </div>
    );
}
