import React from 'react';
import {Button, Loader, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {DEFAULT_FORMATTERS, DEFAULT_LABELS} from './format';
import {LazyEngines, preloadEngine} from './engines/registry';
import {CHART_MODES} from './types';
import type {ChartMode, ChartWidgetProps} from './types';

const DEFAULT_HEIGHT = 360;

class EngineBoundary extends React.Component<
  {children: React.ReactNode; height: number; onRetry: () => void},
  {failed: boolean}
> {
  state = {failed: false};

  static getDerivedStateFromError() {
    return {failed: true};
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <div role="alert" style={centered(this.props.height)}>
        <Text color="secondary">Не удалось загрузить график</Text>
        <Button
          view="outlined"
          onClick={() => {
            this.setState({failed: false});
            this.props.onRetry();
          }}
        >
          Повторить
        </Button>
      </div>
    );
  }
}

const centered = (height: number): React.CSSProperties => ({
  height,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
});

export function ChartWidget({
  data,
  mode: controlledMode,
  defaultMode = 'sales',
  onModeChange,
  height = DEFAULT_HEIGHT,
  formatValue,
  labels,
  className,
}: ChartWidgetProps) {
  const [innerMode, setInnerMode] = React.useState<ChartMode>(defaultMode);
  const mode = controlledMode ?? innerMode;
  const [attempt, setAttempt] = React.useState(0);

  const changeMode = React.useCallback(
    (next: ChartMode) => {
      if (controlledMode === undefined) {
        setInnerMode(next);
      }
      onModeChange?.(next);
    },
    [controlledMode, onModeChange],
  );

  const warmUp = React.useCallback(() => {
    CHART_MODES.filter((m) => m !== mode).forEach((m) => void preloadEngine(m).catch(() => {}));
  }, [mode]);

  const format = formatValue?.[mode] ?? DEFAULT_FORMATTERS[mode];
  const Engine = LazyEngines[mode];
  const series = data[mode];

  return (
    <section className={className} aria-label="График">
      <div
        style={{display: 'inline-block'}}
        // Прогреваем чанк соседнего режима до клика: к выбору он обычно уже в кэше.
        onPointerEnter={warmUp}
        onFocusCapture={warmUp}
      >
        <SegmentedRadioGroup
          value={mode}
          onUpdate={(value) => changeMode(value as ChartMode)}
          aria-label="Тип графика"
        >
          {CHART_MODES.map((m) => (
            <SegmentedRadioGroup.Option key={m} value={m}>
              {labels?.[m] ?? DEFAULT_LABELS[m]}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </div>

      <div style={{marginTop: 16}}>
        <EngineBoundary
          key={`${mode}:${attempt}`}
          height={height}
          onRetry={() => setAttempt((n) => n + 1)}
        >
          <React.Suspense
            fallback={
              <div style={centered(height)}>
                <Loader size="m" />
              </div>
            }
          >
            <Engine series={series} height={height} formatValue={format} />
          </React.Suspense>
        </EngineBoundary>
      </div>
    </section>
  );
}
