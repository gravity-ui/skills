import {useMemo} from 'react';

import {createMonitoringDataset, createSalesDataset} from './viz/demoData';
import {VizWidget} from './viz/VizWidget';

export function App() {
  const datasets = useMemo(
    () => ({sales: createSalesDataset(), monitoring: createMonitoringDataset()}),
    [],
  );

  return (
    <div style={{padding: 24}}>
      <VizWidget title="Динамика показателей" datasets={datasets} defaultMode="sales" height={360} />
    </div>
  );
}
