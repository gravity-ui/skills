import {useMemo, useState} from 'react';
import {SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {ChartWidget} from './widget/ChartWidget';
import type {WidgetMode} from './widget/types';
import {defaultTooltipXFormat, defaultXTickFormat} from './widget/format';
import {makeMonitoringData, makeSalesData, monthFull, monthTick, rubAxis, rubCompact} from './data/demoData';

export function App() {
  const [mode, setMode] = useState<WidgetMode>('sales');

  // Данные генерируются только для активного режима — как и чанк движка.
  const series = useMemo(
    () => (mode === 'sales' ? makeSalesData() : makeMonitoringData()),
    [mode],
  );

  return (
    <div style={{maxWidth: 920, margin: '0 auto', padding: 24}}>
      <Text variant="header-1" as="h1">
        Виджет визуализации
      </Text>

      <div style={{margin: '14px 0 16px'}}>
        <SegmentedRadioGroup
          value={mode}
          onUpdate={(value) => setMode(value as WidgetMode)}
          options={[
            {value: 'sales', content: 'Продажи'},
            {value: 'monitoring', content: 'Мониторинг'},
          ]}
        />
      </div>

      {mode === 'sales' ? (
        <ChartWidget
          mode="sales"
          title="Выручка по каналам"
          subtitle="помесячно за 24 месяца, ₽"
          series={series}
          yTickFormat={rubAxis}
          xTickFormat={monthTick}
          tooltipValueFormat={rubCompact}
          tooltipXFormat={monthFull}
        />
      ) : (
        <ChartWidget
          mode="monitoring"
          title="Нагрузка кластера"
          subtitle="шаг 5 с · 5400 точек на метрику"
          series={series}
          height={280}
          yTickFormat={(v) => `${Math.round(v)}%`}
          xTickFormat={defaultXTickFormat}
          tooltipValueFormat={(v) => `${v.toFixed(1)}%`}
          tooltipXFormat={defaultTooltipXFormat}
        />
      )}
    </div>
  );
}
