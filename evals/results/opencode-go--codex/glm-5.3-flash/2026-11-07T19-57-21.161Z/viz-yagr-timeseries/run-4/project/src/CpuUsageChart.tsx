import '@gravity-ui/yagr/index.css';

import {useEffect, useMemo, useRef} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import type {MinimalValidConfig, RawSerieData} from '@gravity-ui/yagr';
import Yagr from '@gravity-ui/yagr';

import {type CpuSample} from './cpu-usage-stream';

type CpuUsageChartProps = {
    samples: CpuSample[];
    endTimestamp: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const CPU_SERIES_ID = 'cpu-usage';

export function CpuUsageChart({samples, endTimestamp}: CpuUsageChartProps) {
    const theme = useThemeType();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<Yagr<MinimalValidConfig> | null>(null);

    const timeline = useMemo(() => samples.map((sample) => sample.timestamp), [samples]);
    const values = useMemo(() => samples.map((sample) => sample.value), [samples]);
    const axesConfig = useMemo(
        () => createAxesConfig(endTimestamp - DAY_MS),
        [endTimestamp],
    );

    const initialConfig = useMemo(
        (): MinimalValidConfig => ({
            chart: {
                series: {type: 'area'},
                appearance: {theme: 'light'},
            },
            timeline,
            series: [createCpuSeries(values)],
            axes: axesConfig,
            scales: {y: {type: 'linear', min: 0, max: 1}},
            cursor: {snapToValues: 'closest'},
        }),
        [axesConfig, endTimestamp, timeline, values],
    );

    useEffect(() => {
        if (!containerRef.current) {
            return undefined;
        }

        const chart = new Yagr<MinimalValidConfig>(containerRef.current, initialConfig);
        chartRef.current = chart;

        return () => {
            chart.dispose();
            chartRef.current = null;
        };
    }, [initialConfig]);

    useEffect(() => {
        const chart = chartRef.current;

        if (!chart || chart.config.timeline === timeline) {
            return;
        }

        chart.batch(() => {
            chart.setSeries(timeline, [createCpuSeries(values)], {incremental: false});
        });
    }, [endTimestamp, timeline, values]);

    useEffect(() => {
        const chart = chartRef.current;
        const yagrTheme = theme === 'dark' ? 'dark' : 'light';

        chart?.setTheme(yagrTheme);
    }, [theme]);

    return <div ref={containerRef} className="cpu-usage-chart" />;
}

function createCpuSeries(values: number[]): RawSerieData {
    return {
        id: CPU_SERIES_ID,
        name: 'Загрузка CPU',
        type: 'area',
        data: values,
        color: 'var(--g-color-data-flowchart-region-success-fill)',

        formatter: (value) => `${Math.round((Number(value) || 0) * 100)}%`,
        precision: 2,
    };
}

function createAxesConfig(minTimestamp: number): MinimalValidConfig['axes'] {
    const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
    });

    return {
        x: {
            scale: 'x',

            values: (_chart, ticks) => ticks.map((value) => timeFormatter.format(value)),
            grid: {show: true, stroke: 'var(--g-color-line-generic)'},
            labelSize: 11,
            stroke: 'var(--g-color-text-hint)',
        },
        y: {
            scale: 'y',

            values: (_chart, ticks) => ticks.map((value) => `${Math.round(value * 100)}%`),
            grid: {show: true, stroke: 'var(--g-color-line-generic)'},
            stroke: 'var(--g-color-text-hint)',
        },
    };
}
