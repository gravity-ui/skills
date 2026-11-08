import React from 'react';
import ChartKit from '@gravity-ui/chartkit';
import {Loader, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';

import {buildChartConfig} from './buildChartConfig';
import type {ChartWidgetData, ChartWidgetMode} from './types';
import './registerPlugins';
import './ChartWidget.css';

const MODE_LABELS: Record<ChartWidgetMode, string> = {
  sales: 'Продажи',
  monitoring: 'Мониторинг',
};

export type ChartWidgetProps = {
  data: ChartWidgetData;
  title?: string;
  /** Controlled mode. Omit to let the widget manage it. */
  mode?: ChartWidgetMode;
  defaultMode?: ChartWidgetMode;
  onModeChange?: (mode: ChartWidgetMode) => void;
  /** Plot height in px; ChartKit needs an explicit container height. */
  height?: number;
};

export function ChartWidget({
  data,
  title,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  height = 360,
}: ChartWidgetProps) {
  const [uncontrolledMode, setUncontrolledMode] = React.useState(defaultMode);
  const mode = controlledMode ?? uncontrolledMode;
  const theme = useThemeType();

  const chart = React.useMemo(() => buildChartConfig(mode, data, theme), [mode, data, theme]);

  const handleModeChange = (next: ChartWidgetMode) => {
    setUncontrolledMode(next);
    onModeChange?.(next);
  };

  return (
    <section className="chart-widget">
      <div className="chart-widget__header">
        {title && <Text variant="subheader-3">{title}</Text>}
        <SegmentedRadioGroup<ChartWidgetMode> value={mode} onUpdate={handleModeChange}>
          {(Object.keys(MODE_LABELS) as ChartWidgetMode[]).map((value) => (
            <SegmentedRadioGroup.Option key={value} value={value}>
              {MODE_LABELS[value]}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </div>
      <div className="chart-widget__plot" style={{height}}>
        {/* key: each engine gets a fresh ChartKit instance and error boundary */}
        <ChartKit
          key={chart.type}
          {...chart}
          renderPluginLoader={() => (
            <div className="chart-widget__loader">
              <Loader size="m" />
            </div>
          )}
        />
      </div>
    </section>
  );
}
