import { useState, type CSSProperties } from 'react';
import { Button, Text, useThemeType } from '@gravity-ui/uikit';

export interface LinePoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LinePoint[];
  title: string;
  subtitle?: string;
  /** Unit shown after values in the tooltip and table header, e.g. "тыс.". */
  unit?: string;
  /** Gridline step on the y axis. */
  yStep?: number;
}

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 48, bottom: 36, left: 48 };

/**
 * Series hue: categorical slot 1 of the validated palette, stepped per mode
 * (light #2a78d6 / dark #3987e5). Both pass the lightness band and the 3:1
 * contrast check against the app's actual surfaces (#ffffff / #221d22).
 * Surface, text and grid colors come from the Gravity theme tokens, so the
 * chart always matches the app's own light or dark background.
 */
const SERIES_COLOR = { light: '#2a78d6', dark: '#3987e5' } as const;

const fmt = (value: number) => value.toLocaleString('ru-RU');

export function LineChart({ data, title, subtitle, unit = '', yStep = 200 }: LineChartProps) {
  const themeType = useThemeType();
  const color = SERIES_COLOR[themeType];

  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const innerW = WIDTH - MARGIN.left - MARGIN.right;
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const baseline = MARGIN.top + innerH;
  const band = innerW / data.length;

  const maxValue = Math.max(...data.map((d) => d.value));
  const yMax = Math.max(yStep, Math.ceil(maxValue / yStep) * yStep);
  const ticks = Array.from({ length: yMax / yStep + 1 }, (_, i) => i * yStep);

  const xAt = (i: number) => MARGIN.left + (i + 0.5) * band;
  const yAt = (v: number) => MARGIN.top + innerH * (1 - v / yMax);
  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  const endPoint = points[points.length - 1];
  const activePoint = active !== null ? points[active] : null;

  return (
    <div style={{ width: '100%', maxWidth: WIDTH, fontFamily: 'var(--g-text-body-font-family)' }}>
      <div style={{ marginBottom: 12 }}>
        <Text as="h2" variant="subheader-2">
          {title}
        </Text>
        {subtitle && (
          <div>
            <Text variant="body-1" color="secondary">
              {subtitle}
            </Text>
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          role="img"
          aria-label={title}
          style={{ display: 'block', overflow: 'visible' }}
          onPointerLeave={() => setActive(null)}
        >
          {/* Hairline gridlines + y-axis ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={yAt(t)}
                y2={yAt(t)}
                stroke="var(--g-color-line-generic)"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={MARGIN.left - 8}
                y={yAt(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--g-color-text-secondary)"
                fontSize={12}
              >
                {fmt(t)}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.label}
              x={xAt(i)}
              y={baseline + 22}
              textAnchor="middle"
              fill="var(--g-color-text-secondary)"
              fontSize={12}
            >
              {d.label}
            </text>
          ))}

          {/* Series line: 2px, round joins and caps */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Direct label on the endpoint only; text uses primary ink, not the series hue */}
          <circle
            cx={endPoint.x}
            cy={endPoint.y}
            r={4}
            fill={color}
            stroke="var(--g-color-base-background)"
            strokeWidth={2}
          />
          <text
            x={endPoint.x + 10}
            y={endPoint.y}
            dominantBaseline="middle"
            fill="var(--g-color-text-primary)"
            fontSize={12}
            fontWeight={600}
          >
            {fmt(data[data.length - 1].value)}
          </text>

          {/* Hover / focus layer: one full-height hit column per point */}
          <g role="list" aria-label={`${title}: значения по точкам`}>
            {data.map((d, i) => (
              <rect
                key={d.label}
                role="listitem"
                tabIndex={0}
                aria-label={`${d.label}: ${fmt(d.value)} ${unit}`.trim()}
                x={MARGIN.left + i * band}
                y={MARGIN.top}
                width={band}
                height={innerH}
                fill="transparent"
                style={{ outline: 'none' }}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
            ))}
          </g>

          {activePoint && (
            <g pointerEvents="none">
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={MARGIN.top}
                y2={baseline}
                stroke="var(--g-color-line-generic-accent)"
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={5}
                fill={color}
                stroke="var(--g-color-base-background)"
                strokeWidth={2}
              />
            </g>
          )}
        </svg>

        {activePoint && active !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${(activePoint.x / WIDTH) * 100}%`,
              top: `${(activePoint.y / HEIGHT) * 100}%`,
              // Flip below the point when it sits near the top edge, so the tooltip
              // never overlaps the title above the chart.
              transform:
                activePoint.y < MARGIN.top + 48
                  ? 'translate(-50%, 12px)'
                  : 'translate(-50%, calc(-100% - 12px))',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid var(--g-color-line-generic)',
              background: 'var(--g-color-base-float)',
              color: 'var(--g-color-text-primary)',
              fontSize: 13,
              lineHeight: '18px',
            }}
          >
            <span style={{ color: 'var(--g-color-text-secondary)' }}>{data[active].label}</span>{' '}
            <strong>
              {fmt(data[active].value)} {unit}
            </strong>
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <Button view="outlined" size="m" onClick={() => setShowTable((s) => !s)}>
          {showTable ? 'Скрыть таблицу' : 'Показать таблицу'}
        </Button>
      </div>

      {showTable && (
        <table
          style={{
            width: '100%',
            marginTop: 12,
            borderCollapse: 'collapse',
            color: 'var(--g-color-text-primary)',
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <th scope="col" style={cellStyle('left')}>
                Месяц
              </th>
              <th scope="col" style={cellStyle('right')}>
                Значение{unit ? `, ${unit}` : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label}>
                <td style={cellStyle('left')}>{d.label}</td>
                <td style={{ ...cellStyle('right'), fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(d.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function cellStyle(align: 'left' | 'right'): CSSProperties {
  return {
    textAlign: align,
    padding: '6px 8px',
    borderBottom: '1px solid var(--g-color-line-generic)',
    fontWeight: 400,
  };
}
