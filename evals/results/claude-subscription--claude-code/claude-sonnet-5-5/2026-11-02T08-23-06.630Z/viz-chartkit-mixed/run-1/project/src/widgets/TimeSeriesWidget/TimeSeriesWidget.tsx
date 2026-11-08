import React from 'react';
import {Alert, Button, Loader, SegmentedRadioGroup, Text, useThemeValue} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import {ENGINE_BY_MODE} from './engines';
import {MAX_SERIES} from './palette';
import type {ThemeName, TimeSeriesMode, TimeSeriesWidgetProps} from './types';
import {useEngine} from './useEngine';

const MODE_LABELS: Record<TimeSeriesMode, string> = {
  sales: 'Продажи',
  monitoring: 'Мониторинг',
};

/**
 * Единый виджет: переключатель режимов + один график.
 * Снаружи — один API (`data`, `mode`, `onModeChange`); какой движок рисует режим,
 * знает только слой adapters/engines.
 */
export function TimeSeriesWidget({
  data,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  title,
  height = 360,
}: TimeSeriesWidgetProps) {
  const [innerMode, setInnerMode] = React.useState<TimeSeriesMode>(defaultMode);
  const mode = controlledMode ?? innerMode;
  const theme: ThemeName = useThemeValue().startsWith('dark') ? 'dark' : 'light';
  const [attempt, setAttempt] = React.useState(0);

  const handleModeChange = (next: TimeSeriesMode) => {
    if (controlledMode === undefined) {
      setInnerMode(next);
    }
    onModeChange?.(next);
  };

  const engine = useEngine(mode, attempt);
  const modeData = data[mode];

  const chart = React.useMemo(() => {
    if (modeData.series.length > MAX_SERIES) {
      return {error: new Error(`Поддерживается не более ${MAX_SERIES} серий в режиме`)};
    }
    try {
      return ENGINE_BY_MODE[mode] === 'gravity-charts'
        ? {type: 'gravity-charts' as const, data: toGravityChartsData(modeData, theme)}
        : {type: 'yagr' as const, data: toYagrData(modeData, theme)};
    } catch (error) {
      return {error: error as Error};
    }
  }, [mode, modeData, theme]);

  const pointsCount = modeData.timeline.length * modeData.series.length;

  let body: React.ReactNode;
  if (engine.status === 'error' || 'error' in chart) {
    const error = engine.status === 'error' ? engine.error : (chart as {error: Error}).error;
    body = (
      <Alert
        theme="danger"
        title="Не удалось построить график"
        message={error.message}
        actions={
          engine.status === 'error' ? (
            <Button view="outlined" onClick={() => setAttempt((a) => a + 1)}>
              Повторить
            </Button>
          ) : undefined
        }
      />
    );
  } else if (engine.status === 'loading') {
    body = (
      <div style={{height, display: 'grid', placeItems: 'center'}}>
        <Loader size="m" />
      </div>
    );
  } else {
    const {ChartKit} = engine;
    body = (
      <div style={{height}} role="img" aria-label={`${title ?? 'График'}: ${MODE_LABELS[mode]}`}>
        {/* key: при смене режима движок пересоздаётся, а не перерисовывается чужими данными */}
        <ChartKit key={mode} {...(chart as {type: 'yagr'; data: never})} />
      </div>
    );
  }

  return (
    <section style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'}}>
        <div>
          {title && <Text variant="header-1">{title}</Text>}
          <div>
            <Text variant="body-1" color="secondary">
              {modeData.series.map((s) => s.name).join(' · ')} · {pointsCount.toLocaleString('ru-RU')} точек
            </Text>
          </div>
        </div>
        <SegmentedRadioGroup value={mode} onUpdate={(v) => handleModeChange(v as TimeSeriesMode)}>
          {(Object.keys(MODE_LABELS) as TimeSeriesMode[]).map((m) => (
            <SegmentedRadioGroup.Option key={m} value={m}>
              {MODE_LABELS[m]}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </header>
      {body}
    </section>
  );
}
