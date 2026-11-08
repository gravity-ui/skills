import React from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';

import type {EngineProps} from '../types';
import {buildSalesConfig} from './salesConfig';

// settings.set мерджит плагины по `type`, поэтому соседний движок не затирается.
settings.set({plugins: [GravityChartsPlugin], lang: 'ru'});

export default function SalesEngine({series, height, formatValue}: EngineProps) {
  const data = React.useMemo(() => buildSalesConfig(series, formatValue), [series, formatValue]);
  return (
    <div style={{height}}>
      <ChartKit type="gravity-charts" data={data} />
    </div>
  );
}
