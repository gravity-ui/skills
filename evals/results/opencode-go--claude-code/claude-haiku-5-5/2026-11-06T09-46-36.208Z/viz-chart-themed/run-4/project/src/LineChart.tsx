import * as React from 'react';
import { Text } from '@gravity-ui/uikit';

export interface SeriesPoint {
  /** Короткая подпись по оси X */
  x: string;
  /** Полная подпись для подсказки (необязательно) */
  fullLabel?: string;
  /** Значение по оси Y */
  y: number;
}

export interface LineChartProps {
  title: string;
  data: SeriesPoint[];
  unit?: string;
  height?: number;
}

const MARGIN = { top: 16, right: 24, bottom: 28, left: 56 } as const;
const TICK_COUNT = 4;
const MIN_LABEL_GAP_PX = 60;

interface Scale {
  min: number;
  max: number;
  ticks: number[];
}

/** Округляет диапазон до «красивых» шагов (1, 2, 5 × 10^n). */
function niceScale(dataMin: number, dataMax: number, count: number): Scale {
  const span = dataMax - dataMin || Math.abs(dataMax) || 1;
  const rough = span / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * magnitude;
  const min = Math.floor(dataMin / step) * step;
  const max = Math.ceil(dataMax / step) * step;
  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v += step) {
    ticks.push(Number(v.toFixed(6)));
  }
  return { min, max, ticks };
}

/**
 * Линейный график на SVG. Все цвета — токены Gravity UI (CSS-переменные),
 * которые переключаются вместе с ближайшим ThemeProvider, поэтому график
 * сам подстраивается под светлую/тёмную тему без отдельной логики.
 */
export function LineChart({ title, data, unit = '', height = 320 }: LineChartProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [width, setWidth] = React.useState(0);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }
    setWidth(el.clientWidth);
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const values = data.map((d) => d.y);
  const scale = React.useMemo(
    () =>
      values.length
        ? niceScale(Math.min(...values), Math.max(...values), TICK_COUNT)
        : { min: 0, max: 1, ticks: [0, 1] },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  if (data.length === 0) {
    return <Text color="secondary">Нет данных</Text>;
  }

  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const xAt = (i: number) =>
    MARGIN.left + (data.length > 1 ? (i * innerW) / (data.length - 1) : innerW / 2);
  const yAt = (v: number) =>
    MARGIN.top + innerH - ((v - scale.min) / (scale.max - scale.min)) * innerH;

  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.y) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  // Чтобы подписи по оси X не слипались, показываем каждую n-ю.
  const maxLabels = Math.max(1, Math.floor(innerW / MIN_LABEL_GAP_PX));
  const labelStride = Math.ceil(data.length / maxLabels);

  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect || innerW === 0) {
      return;
    }
    const px = e.clientX - svgRect.left;
    const ratio = (px - MARGIN.left) / innerW;
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, index)));
  };

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;
  const last = points[points.length - 1];
  const lastValue = data[data.length - 1];

  // Подсказка не должна уезжать за края графика.
  const TOOLTIP_HALF_WIDTH = 70;
  const tooltipLeft = hoveredPoint
    ? Math.min(Math.max(hoveredPoint.x, TOOLTIP_HALF_WIDTH), Math.max(width - TOOLTIP_HALF_WIDTH, TOOLTIP_HALF_WIDTH))
    : 0;

  return (
    <div>
      <Text variant="subheader-2" as="h3" style={{ display: 'block', marginBottom: 12 }}>
        {title}
      </Text>

      <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
        {width > 0 && (
          <svg
            ref={svgRef}
            width={width}
            height={height}
            role="img"
            aria-label={`${title}: график за ${data.length} периодов`}
            style={{ display: 'block', overflow: 'visible' }}
            fontFamily="inherit"
          >
            {/* Горизонтальная сетка и подписи оси Y */}
            {scale.ticks.map((t) => (
              <g key={t}>
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + innerW}
                  y1={yAt(t)}
                  y2={yAt(t)}
                  strokeWidth={1}
                  style={{ stroke: 'var(--g-color-line-generic)' }}
                />
                <text
                  x={MARGIN.left - 8}
                  y={yAt(t)}
                  dy="0.32em"
                  textAnchor="end"
                  fontSize={12}
                  style={{ fill: 'var(--g-color-text-secondary)' }}
                >
                  {t.toLocaleString('ru-RU')}
                </text>
              </g>
            ))}

            {/* Подписи оси X */}
            {data.map((d, i) =>
              i % labelStride === 0 ? (
                <text
                  key={`${d.x}-${i}`}
                  x={points[i].x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={12}
                  style={{ fill: 'var(--g-color-text-secondary)' }}
                >
                  {d.x}
                </text>
              ) : null,
            )}

            {/* Линия серии: толщина 2px, токен информационного цвета */}
            <path
              d={linePath}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ stroke: 'var(--g-color-base-info-heavy)' }}
            />

            {/* Прямая подпись последней точки */}
            <text
              x={last.x}
              y={last.y - 12}
              textAnchor="end"
              fontSize={13}
              fontWeight={600}
              style={{ fill: 'var(--g-color-text-primary)' }}
            >
              {lastValue.y.toLocaleString('ru-RU')}
              {unit ? ` ${unit}` : ''}
            </text>

            {/* Прицел и маркер при наведении */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  x2={hoveredPoint.x}
                  y1={MARGIN.top}
                  y2={MARGIN.top + innerH}
                  strokeWidth={1}
                  style={{ stroke: 'var(--g-color-line-generic-hover)' }}
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r={5}
                  strokeWidth={2}
                  style={{
                    fill: 'var(--g-color-base-background)',
                    stroke: 'var(--g-color-base-info-heavy)',
                  }}
                />
              </g>
            )}

            {/* Невидимая область для перехвата указателя */}
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setHoverIndex(null)}
            />
          </svg>
        )}

        {hovered && hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              left: tooltipLeft,
              top: hoveredPoint.y - 14,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--g-color-line-generic)',
              background: 'var(--g-color-base-float)',
              color: 'var(--g-color-text-primary)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              fontSize: 13,
            }}
          >
            <div style={{ color: 'var(--g-color-text-secondary)' }}>
              {hovered.fullLabel ?? hovered.x}
            </div>
            <div style={{ fontWeight: 600 }}>
              {hovered.y.toLocaleString('ru-RU')}
              {unit ? ` ${unit}` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Табличная альтернатива для доступности */}
      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--g-color-text-secondary)' }}>
          Показать данные таблицей
        </summary>
        <table
          style={{
            marginTop: 8,
            borderCollapse: 'collapse',
            fontSize: 13,
            color: 'var(--g-color-text-primary)',
          }}
        >
          <thead>
            <tr>
              <th style={cellStyle}>Период</th>
              <th style={cellStyle}>Значение{unit ? `, ${unit}` : ''}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${d.x}-row-${i}`}>
                <td style={cellStyle}>{d.fullLabel ?? d.x}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>{d.y.toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  padding: '4px 12px',
  borderBottom: '1px solid var(--g-color-line-generic)',
  textAlign: 'left',
};
