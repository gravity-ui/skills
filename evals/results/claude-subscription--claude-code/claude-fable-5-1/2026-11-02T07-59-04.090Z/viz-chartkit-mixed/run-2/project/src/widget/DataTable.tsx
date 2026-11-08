import React from 'react';
import {Text} from '@gravity-ui/uikit';

import {formatValue} from './data';
import type {ChartWidgetMode, TimeSeriesDataset} from './types';

interface DataTableProps {
    dataset: TimeSeriesDataset;
    mode: ChartWidgetMode;
    colors: string[];
}

const MAX_ROWS = 60;

function formatTime(ts: number, dense: boolean, timeZone?: string): string {
    return new Date(ts).toLocaleString('ru-RU', {
        timeZone,
        year: '2-digit',
        month: 'short',
        day: dense ? '2-digit' : undefined,
        hour: dense ? '2-digit' : undefined,
        minute: dense ? '2-digit' : undefined,
    });
}

function summarize(values: (number | null)[]) {
    const nums = values.filter((v): v is number => v !== null);
    if (!nums.length) {
        return {min: null, avg: null, max: null, last: null};
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
        min: Math.min(...nums),
        avg: sum / nums.length,
        max: Math.max(...nums),
        last: nums[nums.length - 1],
    };
}

/**
 * Табличное представление — доступная альтернатива графику.
 * Разреженный ряд показывается построчно, плотный — сводкой по сериям.
 */
export function DataTable({dataset, mode, colors}: DataTableProps) {
    const {unit, precision, timeZone} = dataset;
    const key = (s: {id: string; name: string}) => (
        <Text as="span" className="chart-widget__key">
            <span className="chart-widget__key-swatch" aria-hidden="true" />
            {s.name}
        </Text>
    );

    if (mode === 'monitoring') {
        return (
            <table className="chart-widget__table" aria-label="Сводка по сериям">
                <thead>
                    <tr>
                        <th>Серия</th>
                        <th>Мин.</th>
                        <th>Среднее</th>
                        <th>Макс.</th>
                        <th>Последнее</th>
                        <th>Точек</th>
                    </tr>
                </thead>
                <tbody>
                    {dataset.series.map((s, i) => {
                        const stats = summarize(s.points.map((p) => p.y));
                        return (
                            <tr key={s.id} style={{'--series-color': colors[i]} as React.CSSProperties}>
                                <td>{key(s)}</td>
                                <td>{formatValue(stats.min, unit, precision ?? 1)}</td>
                                <td>{formatValue(stats.avg, unit, precision ?? 1)}</td>
                                <td>{formatValue(stats.max, unit, precision ?? 1)}</td>
                                <td>{formatValue(stats.last, unit, precision ?? 1)}</td>
                                <td>{s.points.length.toLocaleString('ru-RU')}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    const timestamps = Array.from(new Set(dataset.series.flatMap((s) => s.points.map((p) => p.x))))
        .sort((a, b) => a - b)
        .slice(-MAX_ROWS);
    const lookup = dataset.series.map((s) => new Map(s.points.map((p) => [p.x, p.y] as const)));

    return (
        <table className="chart-widget__table" aria-label="Значения по периодам">
            <thead>
                <tr>
                    <th>Период</th>
                    {dataset.series.map((s, i) => (
                        <th key={s.id} style={{'--series-color': colors[i]} as React.CSSProperties}>
                            {key(s)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {timestamps.map((ts) => (
                    <tr key={ts}>
                        <td>{formatTime(ts, false, timeZone)}</td>
                        {dataset.series.map((s, i) => (
                            <td key={s.id}>{formatValue(lookup[i].get(ts), unit, precision ?? 0)}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
