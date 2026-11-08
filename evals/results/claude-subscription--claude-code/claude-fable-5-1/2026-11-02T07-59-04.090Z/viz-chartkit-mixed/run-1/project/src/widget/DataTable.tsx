import React from 'react';
import {Table, Text} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import type {VizDataset} from './types';

const MAX_ROWS = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

type Row = Record<string, number | null>;

interface DataTableProps {
    dataset: VizDataset;
}

/** Табличное представление того же dataset — значения доступны без наведения и без цвета. */
export function DataTable({dataset}: DataTableProps) {
    const {timeline, series, unit, precision, timeZone} = dataset;

    const formatters = React.useMemo(() => {
        const step = timeline.length > 1 ? timeline[1] - timeline[0] : DAY_MS;
        const date = new Intl.DateTimeFormat('ru-RU', {
            timeZone,
            dateStyle: 'medium',
            timeStyle: step < DAY_MS ? 'medium' : undefined,
        });
        const number = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: precision ?? 2});
        return {date, number};
    }, [timeline, timeZone, precision]);

    const rows = React.useMemo<Row[]>(
        () =>
            timeline.slice(0, MAX_ROWS).map((time, index) => {
                const row: Row = {time};
                for (const serie of series) {
                    row[serie.id] = serie.values[index] ?? null;
                }
                return row;
            }),
        [timeline, series],
    );

    const columns = React.useMemo<TableColumnConfig<Row>[]>(
        () => [
            {
                id: 'time',
                name: 'Время',
                template: (row) => formatters.date.format(row.time as number),
            },
            ...series.map<TableColumnConfig<Row>>((serie) => ({
                id: serie.id,
                name: unit ? `${serie.name}, ${unit}` : serie.name,
                align: 'end',
                template: (row) => {
                    const value = row[serie.id];
                    return value === null ? '—' : formatters.number.format(value);
                },
            })),
        ],
        [series, unit, formatters],
    );

    return (
        <div className="viz-widget__table">
            <Table data={rows} columns={columns} getRowId="time" aria-label="Данные графика" />
            {timeline.length > MAX_ROWS && (
                <Text variant="caption-2" color="secondary" className="viz-widget__table-note">
                    Показаны первые {MAX_ROWS} из {timeline.length} строк
                </Text>
            )}
        </div>
    );
}
