import React, { useMemo } from 'react';
import type { ChartEngineProps } from '../types';

const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };
const COLORS = {
  area: 'rgba(255, 109, 80, 0.18)',
  line: '#ff6d50',
  axis: 'var(--g-color-line-generic, #ddd)',
  text: 'var(--g-color-text-secondary, #888)',
  grid: 'var(--g-color-line-generic, #eee)',
  spike: 'rgba(255, 109, 80, 0.35)',
};

export const MonitoringChart: React.FC<ChartEngineProps> = ({ data, width, height, title }) => {
  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const { path, areaPath, xTicks, yTicks, stats } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', xTicks: [], yTicks: [], stats: null };

    const timestamps = data.map((d) => d.timestamp);
    const values = data.map((d) => d.value);
    const xMin = Math.min(...timestamps);
    const xMax = Math.max(...timestamps);
    const yMin = Math.min(...values);
    const yMax = Math.max(...values);
    const yRange = yMax - yMin || 1;

    const scaleX = (v: number) => ((v - xMin) / (xMax - xMin || 1)) * chartW;
    const scaleY = (v: number) => chartH - ((v - yMin) / yRange) * chartH;

    const points = data.map((d) => `${scaleX(d.timestamp).toFixed(2)},${scaleY(d.value).toFixed(2)}`);
    const pathD = 'M' + points.join(' L');
    const areaD = pathD + ` L${scaleX(data[data.length - 1].timestamp).toFixed(2)},${chartH} L${scaleX(data[0].timestamp).toFixed(2)},${chartH} Z`;

    const tickCount = 5;
    const yStep = yRange / (tickCount - 1 || 1);
    const yTicksArr = Array.from({ length: tickCount }, (_, i) => yMin + i * yStep);

    const xTickCount = Math.min(6, data.length);
    const xStep = (xMax - xMin) / (xTickCount - 1 || 1);
    const xTicksArr = Array.from({ length: xTickCount }, (_, i) => xMin + i * xStep);

    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const peak = Math.max(...values);
    const peakIdx = values.indexOf(peak);

    return { path: pathD, areaPath: areaD, xTicks: xTicksArr, yTicks: yTicksArr, stats: { avg, peak, peakIdx } };
  }, [data, chartW, chartH]);

  const headerH = title ? 22 : 0;

  return (
    <div style={{ width, height, position: 'relative', fontFamily: 'monospace' }}>
      {stats && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 11,
            padding: '2px 4px',
            color: 'var(--g-color-text-secondary, #888)',
            position: 'absolute',
            top: 0,
            right: PADDING.right,
            zIndex: 1,
          }}
        >
          <span>avg: {stats.avg.toFixed(1)}</span>
          <span>peak: {stats.peak}</span>
        </div>
      )}
      <svg width={width} height={height - headerH} viewBox={`0 0 ${width} ${height - headerH}`}>
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {/* Y axis */}
          <line x1={0} y1={0} x2={0} y2={chartH} stroke={COLORS.axis} strokeWidth={1} />

          {/* Y ticks + dense grid */}
          {yTicks.map((val, i) => {
            const y = chartH - ((val - Math.min(...data.map((d) => d.value))) / (Math.max(...data.map((d) => d.value)) - Math.min(...data.map((d) => d.value)) || 1)) * chartH;
            return (
              <g key={`y-${i}`}>
                <line x1={0} y1={y} x2={chartW} y2={y} stroke={COLORS.grid} strokeWidth={0.5} strokeDasharray="2 4" />
                <text x={-6} y={y + 4} textAnchor="end" fontSize={10} fill={COLORS.text}>
                  {val % 1 === 0 ? val : val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X ticks */}
          {xTicks.map((val, i) => {
            const x = ((val - Math.min(...data.map((d) => d.timestamp))) / (Math.max(...data.map((d) => d.timestamp)) - Math.min(...data.map((d) => d.timestamp)) || 1)) * chartW;
            return (
              <text key={`x-${i}`} x={x} y={chartH + 16} textAnchor="middle" fontSize={9} fill={COLORS.text}>
                {new Date(val).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={COLORS.area} />

          {/* Line */}
          <path d={path} fill="none" stroke={COLORS.line} strokeWidth={1.5} strokeLinejoin="round" />

          {/* Spike marker at peak */}
          {stats && (
            <g>
              <line
                x1={((data[stats.peakIdx].timestamp - Math.min(...data.map((d) => d.timestamp))) / (Math.max(...data.map((d) => d.timestamp)) - Math.min(...data.map((d) => d.timestamp)) || 1)) * chartW}
                y1={chartH - ((stats.peak - Math.min(...data.map((d) => d.value))) / (Math.max(...data.map((d) => d.value)) - Math.min(...data.map((d) => d.value)) || 1)) * chartH}
                x2={((data[stats.peakIdx].timestamp - Math.min(...data.map((d) => d.timestamp))) / (Math.max(...data.map((d) => d.timestamp)) - Math.min(...data.map((d) => d.timestamp)) || 1)) * chartW}
                y2={chartH}
                stroke={COLORS.spike}
                strokeWidth={1}
                strokeDasharray="3 2"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
