import {Suspense, lazy, useMemo, useState, type CSSProperties} from 'react';
import {ChartLine, Pulse} from '@gravity-ui/icons';
import {Loader, SegmentedRadioGroup} from '@gravity-ui/uikit';

import {visualizationData} from './data';
import type {VisualizationData, VisualizationMode} from './types';

import './VisualizationWidget.css';

const SalesChartEngine = lazy(() => import('./SalesChartEngine'));
const MonitoringChartEngine = lazy(() => import('./MonitoringChartEngine'));

interface VisualizationWidgetProps {
  title?: string;
  initialMode?: VisualizationMode;
  height?: number;
  data?: Partial<Record<VisualizationMode, VisualizationData>>;
  mode?: VisualizationMode;
  onModeChange?: (mode: VisualizationMode) => void;
}

export function VisualizationWidget({
  title = 'Продажи и мониторинг',
  initialMode = 'sales',
  height = 320,
  data,
  mode,
  onModeChange,
}: VisualizationWidgetProps) {
  const [internalMode, setInternalMode] = useState<VisualizationMode>(initialMode);
  const currentMode = mode ?? internalMode;
  const handleModeChange = (nextMode: VisualizationMode) => {
    setInternalMode(nextMode);
    onModeChange?.(nextMode);
  };
  const widgetData = useMemo(() => data?.[currentMode] ?? visualizationData[currentMode], [data, currentMode]);
  const Engine = currentMode === 'sales' ? SalesChartEngine : MonitoringChartEngine;
  const style = {'--visualization-height': `${height}px`, '--chart-height': `${height}px`} as CSSProperties;

  return (
    <section className="visualization-widget" style={style}>
      <header className="visualization-widget__header">
        <div>
          <h2 className="visualization-widget__title">{title}</h2>
          <p className="visualization-widget__subtitle">
            {currentMode === 'sales' ? 'Дневные продажи за 30 дней' : 'Плотный временной ряд за 12 часов'}
          </p>
        </div>
        <SegmentedRadioGroup<VisualizationMode>
          size="m"
          value={currentMode}
          onUpdate={handleModeChange}
          aria-label="Режим визуализации"
        >
          <SegmentedRadioGroup.Option value="sales">
            <ChartLine width={16} height={16} />
            Продажи
          </SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="monitoring">
            <Pulse width={16} height={16} />
            Мониторинг
          </SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </header>
      <Suspense fallback={<Loader size="m" className="visualization-widget__loader" />}>
        <Engine data={widgetData} height={height} />
      </Suspense>
      <footer className="visualization-widget__legend">
        {widgetData.series.map((series) => (
          <span key={series.id} className="visualization-widget__legend-item">
            <span className="visualization-widget__legend-marker" style={{background: series.color}} />
            {series.label}
          </span>
        ))}
      </footer>
    </section>
  );
}
