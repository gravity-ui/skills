import React from 'react';

import {ChartWidget} from './chart-widget';
import {createDemoData} from './demoData';

export function App() {
  const data = React.useMemo(createDemoData, []);

  return (
    <div style={{padding: 24, maxWidth: 1100}}>
      <ChartWidget title="Выручка и задержка API" data={data} />
    </div>
  );
}
