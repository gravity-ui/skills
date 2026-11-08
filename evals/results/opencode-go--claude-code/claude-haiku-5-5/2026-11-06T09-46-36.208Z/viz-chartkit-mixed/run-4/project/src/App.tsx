import React from 'react';

import {VizWidget} from './viz';
import {generateDemoSeries} from './viz/demo-data';

export function App(): React.JSX.Element {
  const series = React.useMemo(() => generateDemoSeries(), []);

  return (
    <main style={{padding: 24, maxWidth: 960, margin: '0 auto'}}>
      <VizWidget title="Выручка по каналам, 15 мин" series={series} unit="₽" defaultMode="sales" height={360} />
    </main>
  );
}
