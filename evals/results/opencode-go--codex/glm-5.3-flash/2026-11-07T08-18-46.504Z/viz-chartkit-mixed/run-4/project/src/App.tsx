import {DashboardVisualizationWidget} from './dashboard-visualization-widget';
import {createMonitoringChartConfig, createSalesChartConfig} from './chart-configs';

export function App() {
  return (
    <main style={{maxWidth: 1200, margin: '0 auto', padding: 24}}>
      <DashboardVisualizationWidget
        data={{
          sales: createSalesChartConfig(),
          monitoring: createMonitoringChartConfig(),
          initialMode: 'sales',
        }}
      />
    </main>
  );
}
