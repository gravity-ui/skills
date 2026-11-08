import React from 'react';

import YagrReact, {type YagrReactRef} from '@gravity-ui/yagr/react';
import type {
    AreaSeriesOptions,
    MinimalValidConfig,
    RawSerieData,
    YagrTheme,
} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import {
    UPDATE_INTERVAL_MS,
    appendNextPoint,
    generateInitialSeries,
    type CpuSeries,
} from './cpuData';

const SERIES_ID = 'cpu';

type AreaSerie = RawSerieData<Omit<AreaSeriesOptions, 'type'> & {type?: 'area'}>;

function createConfig(
    theme: YagrTheme,
    timeline: number[],
    values: number[],
): MinimalValidConfig {
    const serie: AreaSerie = {
        id: SERIES_ID,
        type: 'area',
        name: 'CPU',
        color: 'var(--g-color-base-selection)',
        lineColor: 'var(--g-color-line-brand)',
        lineWidth: 2,
        data: values.slice(),
        formatter: (value) => (typeof value === 'number' ? `${value.toFixed(1)} %` : '—'),
    };

    return {
        // Копии: yagr мутирует переданные массивы при realtime-обновлениях,
        // а эталонные данные остаются в CpuChart и переживают пересоздание графика.
        timeline: timeline.slice(),
        series: [serie],
        chart: {
            timeMultiplier: 1,
            appearance: {theme, locale: 'ru'},
            // adaptive: перерисовка по ResizeObserver, график следует за шириной контейнера
            size: {adaptive: true},
            select: {zoom: true},
        },
        scales: {
            y: {min: 0, max: 100, range: 'nice'},
        },
        axes: {
            y: {precision: 0, splitsCount: 5},
        },
        tooltip: {show: true},
        legend: {show: false},
        markers: {show: false},
    };
}

interface CpuChartProps {
    theme: YagrTheme;
    className?: string;
    onPoint?: (value: number) => void;
}

export function CpuChart({theme, className, onPoint}: CpuChartProps) {
    const chartRef = React.useRef<YagrReactRef>(null);
    const onPointRef = React.useRef(onPoint);
    onPointRef.current = onPoint;

    const dataRef = React.useRef<CpuSeries | null>(null);
    if (dataRef.current === null) {
        dataRef.current = generateInitialSeries();
    }

    const config = React.useMemo(
        () => createConfig(theme, dataRef.current!.timeline, dataRef.current!.values),
        [theme],
    );

    React.useEffect(() => {
        onPointRef.current?.(dataRef.current!.lastValue);

        const timer = window.setInterval(() => {
            const point = appendNextPoint(dataRef.current!);
            onPointRef.current?.(point.value);
            // Инцрементальное обновление скользящего окна: дописывает точку
            // в конец и удаляет столько же точек слева, без полного re-init.
            chartRef.current
                ?.yagr()
                ?.setSeries([point.t], [{id: SERIES_ID, data: [point.value]}], {
                    incremental: true,
                    splice: true,
                });
        }, UPDATE_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, []);

    // key={theme}: при смене темы график пересоздаётся — цвета из CSS-переменных
    // разрешаются заново; старый инстанс освобождается через dispose() в обёртке.
    return (
        <YagrReact
            key={theme}
            ref={chartRef}
            id="cpu-chart"
            className={className}
            config={config}
        />
    );
}
