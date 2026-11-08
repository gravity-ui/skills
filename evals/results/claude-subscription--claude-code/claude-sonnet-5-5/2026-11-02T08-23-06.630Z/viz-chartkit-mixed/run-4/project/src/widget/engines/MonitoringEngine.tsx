import React from 'react';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

import type {EngineProps} from '../types';
import {buildMonitoringConfig} from './monitoringConfig';

settings.set({plugins: [YagrPlugin], lang: 'ru'});

export default function MonitoringEngine({series, height, formatValue}: EngineProps) {
  const data = React.useMemo(
    () => buildMonitoringConfig(series, formatValue),
    [series, formatValue],
  );
  return (
    <div style={{height}}>
      <ChartKit type="yagr" data={data} />
    </div>
  );
}
