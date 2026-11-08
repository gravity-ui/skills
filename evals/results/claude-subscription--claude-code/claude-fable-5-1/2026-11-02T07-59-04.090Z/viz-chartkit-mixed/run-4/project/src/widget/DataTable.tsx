import React from 'react';
import {Table, Text} from '@gravity-ui/uikit';

import type {VizDataset} from './types';

interface Row {
    t: number;
    values: (number | null)[];
}

const MAX_ROWS = 200;

/**
 * Табличное представление — значения доступны и без наведения на график.
 * Для плотных рядов показываем последние строки, чтобы не раздувать DOM.
 */
export function DataTable({dataset, timeZone}: {dataset: VizDataset; timeZone?: string}) {
    const {rows, total} = React.useMemo(() => {
        const byT = new Map<number, (number | null)[]>();
        dataset.series.forEach((s, i) => {
            for (const p of s.points) {
                let row = byT.get(p.t);
                if (!row) {
                    row = new Array<number | null>(dataset.series.length).fill(null);
                    byT.set(p.t, row);
                }
                row[i] = p.y;
            }
        });
        const all = Array.from(byT.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([t, values]) => ({t, values}));
        return {rows: all.slice(-MAX_ROWS), total: all.length};
    }, [dataset]);

    const dateFmt = React.useMemo(
        () =>
            new Intl.DateTimeFormat('ru-RU', {
                dateStyle: 'short',
                timeStyle: 'medium',
                timeZone: timeZone ?? dataset.timeZone,
            }),
        [timeZone, dataset.timeZone],
    );
    const numFmt = React.useMemo(() => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}), []);

    const columns = [
        {id: 'time', name: 'Время', template: (row: Row) => dateFmt.format(row.t)},
        ...dataset.series.map((s, i) => ({
            id: s.id,
            name: dataset.unit ? `${s.name}, ${dataset.unit}` : s.name,
            align: 'end' as const,
            template: (row: Row) => {
                const v = row.values[i];
                return v === null || v === undefined ? '—' : numFmt.format(v);
            },
        })),
    ];

    return (
        <div style={{overflow: 'auto', height: '100%', fontVariantNumeric: 'tabular-nums'}}>
            {total > rows.length ? (
                <Text variant="caption-2" color="secondary" as="div" style={{padding: '4px 0 8px'}}>
                    Показаны последние {rows.length} из {total} строк
                </Text>
            ) : null}
            <Table data={rows} columns={columns} getRowDescriptor={(row) => ({id: String(row.t)})} />
        </div>
    );
}
