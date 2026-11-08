import React, { useMemo } from 'react';
import type { ChartEngineProps } from '../types';

const PADDING = { top: 20, right: 20, bottom: 40, left: 60 };
const COLORS = {
  line: 'var(--g-color-line-positive, #3f86fa)',
  fill: 'rgba(63, 134, 250, 0.12)',
  axis: 'var(--g-color-line-generic, #ddd)',
  text: 'var(--g-color-text-secondary, #888)',
  grid: 'var(--g-color-line-generic, #eee)',
};

export const SalesChart: React.FC<ChartEngineProps> = ({ data, width, height, title }) => {
  const chartW = width - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const { path, areaPath, xTicks, yTicks } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', xTicks: [], yTicks: [] };

    const xs = data.map((d) => d.timestamp);
    const ys = data.map((d) => d.value);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const yRange = yMax - yMin || 1;

    const scaleX = (v: number) => ((v - xMin) / (xMax - xMin || 1)) * chartW;
    const scaleY = (v: number) => chartH - ((v - yMin) / yRange) * chartH;

    const points = data.map((d) => `${scaleX(d.timestamp).toFixed(2)},${scaleY(d.value).toFixed(2)}`);

    const pathD = 'M' + points.join(' L');
    const areaD = pathD + ` L${scaleX(data[data.length - 1].timestamp).toFixed(2)},${chartH} L${scaleX(data[0].timestamp).toFixed(2)},${chartH} Z`;

    const tickCount = Math.min(6, data.length);
    const xStep = (xMax - xMin) / (tickCount - 1 || 1);
    const xTicksArr = Array.from({ length: tickCount }, (_, i) => xMin + i * xStep);

    const yStep = yRange / (tickCount - 1 || 1);
    const yTicksArr = Array.from({ length: tickCount }, (_, i) => yMin + i * yStep);

    return { path: pathD, areaPath: areaD, xTicks: xTicksArr, yTicks: yTicksArr };
  }, [data, chartW, chartH]);

  return (
    <div style={{ width, height, position: 'relative' }}>
      {title && (
        <div style={{ textAlign: 'center', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
          {title}
        </div>
      )}
      <svg width={width} height={height - (title ? 24 : 0)} viewBox={`0 0 ${width} ${height - (title ? 24 : 0)}`}>
        <g transform={`translate(${PADDING.left},${PADDING.top})`}>
          {/* Y axis */}
          <line x1={0} y1={0} x2={0} y2={chartH} stroke={COLORS.axis} strokeWidth={1} />
          {/* X axis */}
          <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={COLORS.axis} strokeWidth={1} />

          {/* Y ticks + grid */}
          {yTicks.map((val, i) => {
            const y = chartH - ((val - Math.min(...data.map((d) => d.value))) / (Math.max(...data.map((d) => d.value)) - Math.min(...data.map((d) => d.value)) || 1)) * chartH;
            return (
              <g key={`y-${i}`}>
                <line x1={0} y1={y} x2={chartW} y2={y} stroke={COLORS.grid} strokeWidth={1} strokeDasharray="4 4" />
                <text x={-8} y={y + 4} textAnchor="end" fontSize={11} fill={COLORS.text}>
                  {val % 1 === 0 ? val : val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X ticks */}
          {xTicks.map((val, i) => {
            const x = ((val - Math.min(...data.map((d) => d.timestamp))) / (Math.max(...data.map((d) => d.timestamp)) - Math.min(...data.map((d) => d.timestamp)) || 1)) * chartW;
            return (
              <text key={`x-${i}`} x={x} y={chartH + 20} textAnchor="middle" fontSize={10} fill={COLORS.text}>
                {new Date(val).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={COLORS.fill} />

          {/* Line */}
          <path d={path} fill="none" stroke={COLORS.line} strokeWidth={2} strokeLinejoin="round" />

          {/* Dots */}
          {data.map((d, i) => {
            const x = ((d.timestamp - Math.min(...data.map((dp) => dp.timestamp))) / (Math.max(...data.map((dp) => dp.timestamp)) - Math.min(...data.map((dp) => dp.timestamp)) || 1)) * chartW;
            const y = chartH - ((d.value - Math.min(...data.map((dp) => dp.value))) / (Math.max(...data.map((dp) => dp.value)) - Math.min(...data.map((dp) => dp.value)) || 1)) * chartH;
            return <circle key={i} cx={x} cy={y} r={3} fill={COLORS.line} />;
          })}
        </g>
      </svg>
    </div>
  );
};
