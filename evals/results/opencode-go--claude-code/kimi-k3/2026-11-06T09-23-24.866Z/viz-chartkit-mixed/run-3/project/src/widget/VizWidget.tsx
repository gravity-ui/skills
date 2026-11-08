import * as React from 'react';

import {Card, SegmentedRadioGroup, Skeleton, Text, useTheme} from '@gravity-ui/uikit';

import type {EngineProps, VizWidgetProps, WidgetMode} from './types';

/**
 * Движки графиков загружаются лениво: каждый — отдельным динамическим
 * import(), поэтому Vite выносит их в отдельные чанки, и код движка
 * приезжает в браузер только при первом включении соответствующего режима.
 */
const ENGINE_LOADERS: Record<WidgetMode, () => Promise<{default: React.ComponentType<EngineProps>}>> = {
  sales: () => import('./engines/SalesChart'),
  monitoring: () => import('./engines/MonitoringChart'),
};

const engineCache = new Map<WidgetMode, React.LazyExoticComponent<React.ComponentType<EngineProps>>>();

function getEngine(mode: WidgetMode) {
  let engine = engineCache.get(mode);
  if (!engine) {
    engine = React.lazy(ENGINE_LOADERS[mode]);
    engineCache.set(mode, engine);
  }
  return engine;
}

const MODE_ORDER: WidgetMode[] = ['sales', 'monitoring'];

export function VizWidget({
  title,
  subtitle,
  modes,
  mode: modeProp,
  defaultMode = 'sales',
  onModeChange,
  height = 280,
}: VizWidgetProps) {
  // Контролируемый / неконтролируемый режим — стандартный паттерн
  const [innerMode, setInnerMode] = React.useState<WidgetMode>(defaultMode);
  const mode = modeProp ?? innerMode;

  const handleModeChange = (next: WidgetMode) => {
    setInnerMode(next);
    onModeChange?.(next);
  };

  const theme = useTheme(); // сигнал canvas-движку перечитать CSS-переменные
  const config = modes[mode];
  const Engine = getEngine(mode);

  const sample = Math.max(1, config.tableSample ?? 1);
  const tableRows = (config.series[0]?.points ?? [])
    .map((p, i) => i)
    .filter((i) => i % sample === 0);

  return (
    <Card className="viz-widget" view="raised">
      <div className="viz-widget__header">
        <div className="viz-widget__heading">
          <Text variant="subheader-2">{title}</Text>
          {subtitle && (
            <Text variant="body-1" color="secondary">
              {subtitle}
            </Text>
          )}
        </div>
        <SegmentedRadioGroup
          aria-label="Режим отображения"
          value={mode}
          onUpdate={handleModeChange}
          options={MODE_ORDER.map((m) => ({value: m, content: modes[m].label}))}
        />
      </div>

      {/* легенда — всегда при двух и более сериях; текст в ink-токенах, цвет несёт маркер */}
      {config.series.length > 1 && (
        <div className="viz-legend">
          {config.series.map((s) => (
            <span className="viz-legend__item" key={s.id}>
              <span className="viz-swatch" style={{background: `var(--series-${s.colorSlot})`}} />
              <span className="viz-legend__name">{s.name}</span>
            </span>
          ))}
        </div>
      )}

      <React.Suspense
        fallback={
          <div className="viz-widget__loading" style={{height}}>
            <Skeleton style={{height: '100%', width: '100%'}} />
          </div>
        }
      >
        <Engine
          series={config.series}
          height={height}
          formatTime={config.formatTime}
          formatValue={config.formatValue}
          ariaLabel={config.ariaLabel}
          themeKey={theme}
        />
      </React.Suspense>

      {/* табличное представление — доступность и проверка значений */}
      <details className="viz-table-details">
        <summary>
          <Text variant="body-1" color="secondary">
            Показать данные таблицей
          </Text>
        </summary>
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead>
              <tr>
                <th>Время</th>
                {config.series.map((s) => (
                  <th key={s.id} className="viz-table__num">
                    <span
                      className="viz-swatch"
                      style={{background: `var(--series-${s.colorSlot})`}}
                    />{' '}
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((i) => (
                <tr key={i}>
                  <td>{config.formatTime(config.series[0].points[i].t)}</td>
                  {config.series.map((s) => (
                    <td key={s.id} className="viz-table__num">
                      {config.formatValue(s.points[i].v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {sample > 1 && (
            <Text variant="caption-1" color="secondary">
              Показана каждая {sample}-я точка из {config.series[0]?.points.length ?? 0}
            </Text>
          )}
        </div>
      </details>
    </Card>
  );
}
