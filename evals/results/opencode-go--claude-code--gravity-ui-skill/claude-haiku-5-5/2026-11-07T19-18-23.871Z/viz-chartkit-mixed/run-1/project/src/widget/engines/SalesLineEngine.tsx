import {useMemo} from 'react';
import {Chart} from '@gravity-ui/charts';

import {toChartsData} from '../adapters';
import type {EngineProps} from '../types';

// Этот модуль загружается лениво (React.lazy) только при режиме «Продажи».
export default function SalesLineEngine({series, colors}: EngineProps) {
    const data = useMemo(() => toChartsData(series, colors), [series, colors]);
    // Chart заполняет родителя, поэтому родитель с явной высотой задаётся виджетом.
    return (
        <div style={{height: '100%'}}>
            <Chart data={data} />
        </div>
    );
}
