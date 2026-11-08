import {Suspense, lazy, useState} from 'react';
import {Loader, SegmentedRadioGroup} from '@gravity-ui/uikit';
import type {VisualizationMode, VisualizationWidgetProps} from './types';

const SalesChart = lazy(() => import('./sales-chart').then((module) => ({default: module.SalesChart})));
const MonitoringChart = lazy(() =>
  import('./monitoring-chart').then((module) => ({default: module.MonitoringChart})),
);

const modes: Array<{value: VisualizationMode; label: string}> = [
  {value: 'sales', label: 'Продажи'},
  {value: 'monitoring', label: 'Мониторинг'},
];

export function VisualizationWidget({mode, data, className}: VisualizationWidgetProps) {
  const [selectedMode, setSelectedMode] = useState<VisualizationMode>(mode);
  const activeMode = selectedMode ?? mode;

  return (
    <section className={className}>
      <SegmentedRadioGroup<VisualizationMode>
        name="visualization-mode"
        value={activeMode}
        onUpdate={setSelectedMode}
      >
        {modes.map(({value, label}) => (
          <SegmentedRadioGroup.Option key={value} value={value} content={label} />
        ))}
      </SegmentedRadioGroup>

      <div className="visualization-chart-container">
        <Suspense fallback={<Loader size="m" />}>
          {activeMode === 'sales' ? (
            <SalesChart data={data.sales} />
          ) : (
            <MonitoringChart data={data.monitoring} />
          )}
        </Suspense>
      </div>
    </section>
  );
}
