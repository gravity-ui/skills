import {useMemo} from 'react';
import {Chart} from '@gravity-ui/charts';

import {toChartsData} from '../adapters';
import type {VizEngineProps} from '../types';

// Загружается лениво из VizWidget: код @gravity-ui/charts не попадает в начальный бандл.
export default function SalesLineEngine({dataset, height}: VizEngineProps) {
  const data = useMemo(() => toChartsData(dataset), [dataset]);

  return (
    <div style={{height}}>
      <Chart data={data} />
    </div>
  );
}
