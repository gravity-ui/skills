import * as React from 'react';
import {Text} from '@gravity-ui/uikit';

import {formatLoad} from './CpuLoadChart';
import type {CpuLoadSource} from './cpuLoadSource';

interface Summary {
    current: number | null;
    average: number | null;
    peak: number | null;
}

function summarize(source: CpuLoadSource): Summary {
    const {values} = source.getSnapshot();
    if (values.length === 0) {
        return {current: null, average: null, peak: null};
    }
    let sum = 0;
    let peak = -Infinity;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
        if (values[i] > peak) {
            peak = values[i];
        }
    }
    return {current: values[values.length - 1], average: sum / values.length, peak};
}

/** Текущее, среднее и пиковое значение за окно — значения графика, доступные без наведения. */
export function CpuLoadSummary({source}: {source: CpuLoadSource}) {
    const [summary, setSummary] = React.useState<Summary>(() => summarize(source));

    React.useEffect(() => {
        setSummary(summarize(source));
        return source.subscribe(() => setSummary(summarize(source)));
    }, [source]);

    const items: Array<[string, number | null]> = [
        ['Сейчас', summary.current],
        ['Среднее за сутки', summary.average],
        ['Пик за сутки', summary.peak],
    ];

    return (
        <dl className="cpu-load-summary" aria-live="off">
            {items.map(([label, value]) => (
                <div key={label} className="cpu-load-summary__item">
                    <Text as="dt" variant="caption-2" color="secondary">
                        {label}
                    </Text>
                    <Text as="dd" variant="subheader-2" color="primary">
                        {formatLoad(value)}
                    </Text>
                </div>
            ))}
        </dl>
    );
}
