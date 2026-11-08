import React from 'react';

import {TimeSeriesWidget} from './widgets/TimeSeriesWidget';
import {makeMonitoringData, makeSalesData} from './widgets/TimeSeriesWidget/mockData';

export function App() {
  const data = React.useMemo(
    () => ({sales: makeSalesData(), monitoring: makeMonitoringData()}),
    [],
  );
  return (
    <div style={{padding: 24, maxWidth: 1100, margin: '0 auto'}}>
      <TimeSeriesWidget title="Динамика показателей" data={data} />
    </div>
  );
}
