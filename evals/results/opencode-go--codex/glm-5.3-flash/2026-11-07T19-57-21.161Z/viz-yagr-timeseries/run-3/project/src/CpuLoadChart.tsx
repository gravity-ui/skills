import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useTheme, type Theme} from '@gravity-ui/uikit';
import Yagr from 'yagr/dist/YagrCore';
import type {MinimalValidConfig} from 'yagr/dist/YagrCore/types';
import type {YagrTheme} from 'yagr/dist/YagrCore/types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const POINT_INTERVAL_MS = 60_000;
const INITIAL_POINT_COUNT = Math.floor(ONE_DAY_MS / POINT_INTERVAL_MS);
const HISTORY_LIMIT = INITIAL_POINT_COUNT;

function mapTheme(theme: Theme): YagrTheme {
    return theme.startsWith('dark') ? 'dark' : 'light';
}

export interface CpuLoadPoint {
    timestamp: number;
    load: number;
}

interface CpuLoadChartProps {
    data: CpuLoadPoint[];
    className?: string;
    height?: number;
}

function generateInitialData(): CpuLoadPoint[] {
    const endTime = Math.floor(Date.now() / POINT_INTERVAL_MS) * POINT_INTERVAL_MS;

    return Array.from({length: INITIAL_POINT_COUNT}, (_, index) => {
        const position = (index + 1) / INITIAL_POINT_COUNT;
        const timestamp = endTime - ONE_DAY_MS + index * POINT_INTERVAL_MS;
        const dailyWave = 24 + 18 * Math.sin((position - 0.2) * Math.PI * 2);
        const noise = (Math.sin(timestamp / 97_000) + Math.sin(timestamp / 18_000)) * 4;

        return {
            timestamp,
            load: Math.min(96, Math.max(4, dailyWave + noise)),
        };
    });
}

export function CpuLoadChart({data, className, height = 360}: CpuLoadChartProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<Yagr<MinimalValidConfig> | null>(null);
    const theme = useTheme();
    const initialData = useMemo(generateInitialData, []);
    const points = data.length > 0 ? data : initialData;

    const getConfig = useCallback(
        (chartData: CpuLoadPoint[], chartTheme: YagrTheme): MinimalValidConfig => ({
            timeline: chartData.map((point) => point.timestamp),
            series: [
                {
                    id: 'cpu-load',
                    name: 'CPU',
                    type: 'line',
                    data: chartData.map((point) => point.load),
                    color: 'var(--g-color-base-accent)',
                    show: true,
                },
            ],
            chart: {
                size: {
                    adaptive: true,
                },
                appereance: {
                    theme: chartTheme,
                    locale: 'ru',
                },
                timeMultiplier: 1,
            },
            cursor: {
                y: {visible: false},
            },
            axes: {
                x: {},
                y: {
                    side: 'left',
                },
            },
            scales: {
                y: {min: 0, max: 100},
            },
            tooltip: {
                show: true,
                tracking: 'sticky',
            },
        }),
        [],
    );

    useEffect(() => {
        const root = rootRef.current;

        if (!root) {
            return undefined;
        }

        const chart = new Yagr(root, getConfig(points, mapTheme(theme)));
        chartRef.current = chart;

        return () => {
            chart.dispose();
            root.textContent = '';
            chartRef.current = null;
        };
    }, [getConfig, points, theme]);

    useEffect(() => {
        const chart = chartRef.current;
        const previousPointCount = previousPointCountRef.current;

        if (!chart || previousPointCount === points.length) {
            previousPointCountRef.current = points.length;
            return;
        }

        const shouldTrim = previousPointCount >= HISTORY_LIMIT && previousPointCount < points.length;
        const addedPoints = shouldTrim ? points.slice(previousPointCount - HISTORY_LIMIT) : points.slice(previousPointCount);

        chart.setSeries(
            addedPoints.map((point) => point.timestamp),
            [
                {
                    id: 'cpu-load',
                    data: addedPoints.map((point) => point.load),
                },
            ],
            {incremental: true, splice: shouldTrim},
        );

        previousPointCountRef.current = points.length;
    }, [points]);

    const previousPointCountRef = useRef(points.length);

    useEffect(() => {
        chartRef.current?.setTheme(mapTheme(theme));
    }, [theme]);

    return (
        <div
            ref={rootRef}
            className={className}
            style={{
                width: '100%',
                minWidth: 0,
                height,
            }}
        />
    );
}
