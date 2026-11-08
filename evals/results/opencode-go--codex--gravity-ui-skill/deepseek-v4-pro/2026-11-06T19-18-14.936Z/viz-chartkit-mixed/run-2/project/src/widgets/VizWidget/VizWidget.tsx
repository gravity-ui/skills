import React from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {SalesLineChart} from './SalesLineChart';
import {MonitorDenseChart} from './MonitorDenseChart';
import type {VizMode, VizWidgetProps} from './types';

const MODE_OPTIONS = [
  {value: 'sales-line', content: 'Продажи'},
  {value: 'monitor-dense', content: 'Мониторинг'},
] as const;

export const VizWidget: React.FC<VizWidgetProps> = ({
  mode,
  onModeChange,
  height = 360,
  title = 'Визуализация',
  salesData,
  monitorData,
}) => {
  return (
    <section style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h2 style={{margin: 0, fontSize: 18}}>{title}</h2>
        <SegmentedRadioGroup value={mode} onUpdate={(v) => onModeChange(v as VizMode)} size="m">
          {MODE_OPTIONS.map((opt) => (
            <SegmentedRadioGroup.Option key={opt.value} value={opt.value} content={opt.content} />
          ))}
        </SegmentedRadioGroup>
      </div>
      <div style={{height}}>
        {mode === 'sales-line' ? (
          <React.Suspense fallback={<p>Загрузка графика…</p>}>
            <SalesLineChart data={salesData ?? []} />
          </React.Suspense>
        ) : (
          <React.Suspense fallback={<p>Загрузка графика…</p>}>
            <MonitorDenseChart
              timeline={monitorData?.timeline ?? []}
              series={monitorData?.series ?? []}
            />
          </React.Suspense>
        )}
      </div>
    </section>
  );
};
