import {useEffect, useMemo, useRef, useState} from 'react';
import YagrChart from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';

import './CpuLoadChart.css';

const STEP_MS = 1000;
const WINDOW_MS = 24 * 60 * 60 * 1000; // last 24 hours
const POINTS_COUNT = WINDOW_MS / STEP_MS; // 86_400 — several tens of thousands of points

const MIN_LOAD = 1;
const MAX_LOAD = 99;

interface CpuData {
    timeline: number[];
    values: number[];
}

export interface CpuLoadChartProps {
    theme: 'light' | 'dark';
}

/** Daily baseline: quiet at night, busy around midday. */
function baselineAt(timestamp: number): number {
    const date = new Date(timestamp);
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    return 38 + 22 * Math.sin(((hour - 9) / 24) * Math.PI * 2);
}

function nextValue(prev: number, timestamp: number): number {
    const target = baselineAt(timestamp);
    const meanReversion = (target - prev) * 0.05;
    const noise = (Math.random() - 0.5) * 4;
    const spike = Math.random() < 0.002 ? 15 + Math.random() * 25 : 0;
    return Math.min(MAX_LOAD, Math.max(MIN_LOAD, prev + meanReversion + noise + spike));
}

function generateInitialData(): CpuData {
    const now = Date.now();
    const start = now - (POINTS_COUNT - 1) * STEP_MS;
    const timeline = new Array<number>(POINTS_COUNT);
    const values = new Array<number>(POINTS_COUNT);
    let value = baselineAt(start);
    for (let i = 0; i < POINTS_COUNT; i++) {
        const ts = start + i * STEP_MS;
        timeline[i] = ts;
        value = nextValue(value, ts);
        values[i] = value;
    }
    return {timeline, values};
}

export function CpuLoadChart({theme}: CpuLoadChartProps) {
    // Data lives in a ref and is mutated in place: with 86k points updating every
    // second, reallocating arrays or routing every point through React state
    // would needlessly tax the main thread.
    const dataRef = useRef<CpuData | null>(null);
    if (dataRef.current === null) {
        dataRef.current = generateInitialData();
    }
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            const data = dataRef.current;
            if (!data) {
                return;
            }
            const ts = data.timeline[data.timeline.length - 1] + STEP_MS;
            // Sliding 24-hour window: append the fresh point, drop the oldest one.
            data.timeline.push(ts);
            data.timeline.shift();
            data.values.push(nextValue(data.values[data.values.length - 1], ts));
            data.values.shift();
            setVersion((v) => v + 1);
        }, STEP_MS);
        return () => window.clearInterval(timer);
    }, []);

    const config = useMemo<MinimalValidConfig>(() => {
        const data = dataRef.current as CpuData;
        return {
            timeline: data.timeline,
            series: [
                {
                    id: 'cpu',
                    name: 'Загрузка CPU',
                    type: 'area',
                    // Resolved by Yagr via getComputedStyle, so the line follows
                    // the active Gravity theme; re-resolved on every theme switch.
                    color: 'var(--g-color-text-brand)',
                    data: data.values,
                    precision: 1,
                    formatter: (value) =>
                        value === null || value === undefined
                            ? '—'
                            : `${Number(value).toFixed(1)} %`,
                },
            ],
            chart: {
                appearance: {theme, locale: 'ru'},
                // Redraws on container resize through Yagr's built-in ResizeObserver.
                size: {adaptive: true},
                // Drag to zoom, double-click to reset.
                select: {zoom: true},
                series: {type: 'area', interpolation: 'linear', lineWidth: 1},
            },
            scales: {
                y: {min: 0, max: 100},
            },
            axes: {
                y: {precision: 0},
            },
            legend: {show: true},
        };
        // `version` produces a new config on every realtime tick, so the wrapper
        // pushes the mutated arrays into the chart through its dynamic update path
        // (setConfig -> setSeries), without recreating the uPlot instance.
    }, [theme, version]);

    return (
        <div className="cpu-load-chart">
            <YagrChart
                id="cpu-load-chart"
                className="cpu-load-chart__graph"
                config={config}
                update="dynamic"
            />
        </div>
    );
}
