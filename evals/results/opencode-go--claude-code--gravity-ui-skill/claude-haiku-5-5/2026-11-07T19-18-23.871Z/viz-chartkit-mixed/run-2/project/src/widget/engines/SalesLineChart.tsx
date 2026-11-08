/**
 * Sales engine: a regular datetime line chart rendered by `@gravity-ui/charts`.
 * Loaded lazily by the widget only when the `sales` mode is shown.
 */
import {useMemo} from 'react';
import {Chart} from '@gravity-ui/charts';

import {toSalesChartData} from '../transform';
import type {EngineProps} from '../types';

export default function SalesLineChart({series, height}: EngineProps) {
    // Chart colors and text follow the uikit `--g-*` tokens, so light/dark needs no extra wiring.
    const data = useMemo(() => toSalesChartData(series), [series]);

    return (
        <div className="vw-engine" style={{height}}>
            <Chart data={data} />
        </div>
    );
}
