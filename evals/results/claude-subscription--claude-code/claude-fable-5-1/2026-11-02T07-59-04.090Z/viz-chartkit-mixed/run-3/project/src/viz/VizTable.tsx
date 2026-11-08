import React from 'react';
import {Table, Text} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import {formatTimestamp, formatValue, isDailyTimeline} from './format';
import type {VizDataset} from './types';

const ROW_LIMIT = 500;

interface VizTableProps {
    dataset: VizDataset;
    colors: string[];
}

interface Row {
    index: number;
    ts: number;
    values: Array<number | null>;
}

/** Табличное представление того же набора данных — значения доступны без наведения. */
export function VizTable({dataset, colors}: VizTableProps) {
    const daily = React.useMemo(() => isDailyTimeline(dataset.timeline), [dataset.timeline]);
    const precision = dataset.precision ?? 0;

    const rows = React.useMemo<Row[]>(() => {
        const total = dataset.timeline.length;
        const start = Math.max(0, total - ROW_LIMIT);
        const result: Row[] = [];
        for (let i = start; i < total; i += 1) {
            result.push({
                index: i,
                ts: dataset.timeline[i],
                values: dataset.series.map((s) => s.values[i] ?? null),
            });
        }
        return result;
    }, [dataset]);

    const columns = React.useMemo<Array<TableColumnConfig<Row>>>(() => {
        const timeColumn: TableColumnConfig<Row> = {
            id: 'ts',
            name: 'Время',
            sticky: 'start',
            template: (row) => formatTimestamp(row.ts, daily),
        };
        const seriesColumns = dataset.series.map<TableColumnConfig<Row>>((s, index) => ({
            id: s.id,
            name: () => (
                <span className="viz-table__series">
                    <span className="viz-table__swatch" style={{background: colors[index]}} aria-hidden />
                    {s.name}
                    {dataset.unit ? `, ${dataset.unit}` : ''}
                </span>
            ),
            align: 'end',
            template: (row) => formatValue(row.values[index], precision),
        }));
        return [timeColumn, ...seriesColumns];
    }, [dataset.series, dataset.unit, colors, daily, precision]);

    const total = dataset.timeline.length;

    return (
        <div className="viz-table">
            {total > ROW_LIMIT ? (
                <Text variant="caption-2" color="secondary" className="viz-table__note">
                    Показаны последние {ROW_LIMIT.toLocaleString('ru-RU')} из{' '}
                    {total.toLocaleString('ru-RU')} точек
                </Text>
            ) : null}
            <Table<Row> data={rows} columns={columns} getRowId={(row) => String(row.index)} />
        </div>
    );
}
