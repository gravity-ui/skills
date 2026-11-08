import {Suspense, useMemo, useState} from 'react';
import {Card, Loader, SegmentedRadioGroup, Text, useThemeValue} from '@gravity-ui/uikit';

import {ENGINES} from './engines';
import {SeriesLegend} from './SeriesLegend';
import {SERIES_COLORS, MAX_SERIES} from './palette';
import type {ChartMode, ChartWidgetProps, EngineSeries} from './types';
import './ChartWidget.css';

const MODE_OPTIONS: {value: ChartMode; label: string}[] = [
  {value: 'sales', label: 'Продажи'},
  {value: 'monitoring', label: 'Мониторинг'},
];

export function ChartWidget({
  title,
  datasets,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  height = 360,
}: ChartWidgetProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<ChartMode>(defaultMode);
  const mode = controlledMode ?? uncontrolledMode;

  const theme = useThemeValue();
  const palette = theme.startsWith('dark') ? SERIES_COLORS.dark : SERIES_COLORS.light;

  const {series: rawSeries, unit} = datasets[mode];
  const overflow = rawSeries.length > MAX_SERIES;

  const series = useMemo<EngineSeries[]>(
    () => rawSeries.map((s, i) => ({...s, color: palette[i]})),
    [rawSeries, palette],
  );

  const Engine = ENGINES[mode];

  const selectMode = (next: ChartMode) => {
    if (controlledMode === undefined) {
      setUncontrolledMode(next);
    }
    onModeChange?.(next);
  };

  return (
    <Card view="outlined" className="cw">
      <header className="cw__header">
        <h2 className="cw__title">{title}</h2>
        <SegmentedRadioGroup
          size="m"
          value={mode}
          onUpdate={(value) => selectMode(value as ChartMode)}
          aria-label="Режим графика"
        >
          {MODE_OPTIONS.map((option) => (
            <SegmentedRadioGroup.Option key={option.value} value={option.value}>
              {option.label}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </header>

      {overflow ? (
        <Text color="danger">
          Серий больше {MAX_SERIES}: в этом виджете они не различимы по цвету. Уменьшите число серий.
        </Text>
      ) : (
        <>
          <SeriesLegend series={series} unit={unit} />
          <div className="cw__body" style={{height}}>
            {/* key пересоздаёт границу загрузки при смене режима */}
            <Suspense
              key={mode}
              fallback={
                <div className="cw__loader">
                  <Loader size="m" />
                </div>
              }
            >
              <Engine series={series} />
            </Suspense>
          </div>
        </>
      )}
    </Card>
  );
}
