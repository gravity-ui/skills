import {useMemo} from 'react';
import type {ChartEngineProps, SalesPoint} from '../App';

export default function SalesChart({data, height, className}: ChartEngineProps) {
  const points = data as SalesPoint[];
  const width = 1000;
  const pad = {top: 22, right: 18, bottom: 38, left: 54};
  const min = 0;
  const max = Math.ceil(Math.max(...points.map((point) => point.value)) / 2) * 2;
  const plotHeight = height - pad.top - pad.bottom;
  const plotWidth = width - pad.left - pad.right;
  const coords = points.map((point, index) => ({
    x: pad.left + (index / Math.max(1, points.length - 1)) * plotWidth,
    y: pad.top + (1 - (point.value - min) / (max - min)) * plotHeight,
    ...point,
  }));
  const line = coords.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1]?.x ?? 0} ${height - pad.bottom} L ${pad.left} ${height - pad.bottom} Z`;
  const ticks = useMemo(() => Array.from({length: 5}, (_, index) => max - (max / 4) * index), [max]);

  return <div className={`engine-wrap ${className ?? ''}`}>
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Линейный график выручки по месяцам">
      <defs><linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7259e8" stopOpacity=".18"/><stop offset="100%" stopColor="#7259e8" stopOpacity="0"/></linearGradient></defs>
      {ticks.map((tick, index) => {
        const y = pad.top + (index / 4) * plotHeight;
        return <g key={tick}><line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="grid-line"/><text x={pad.left - 12} y={y + 4} textAnchor="end" className="axis-text">{tick === 0 ? '0' : `${tick} млн`}</text></g>;
      })}
      <path d={area} fill="url(#sales-fill)"/>
      <path d={line} className="sales-line"/>
      {coords.map((point, index) => <g key={point.label} className="sales-point">
        <circle cx={point.x} cy={point.y} r="12" fill="transparent"/>
        <circle cx={point.x} cy={point.y} r="4" className="sales-point-dot"/>
        <title>{point.label}: ₽ {point.value.toFixed(2)} млн</title>
        {index === coords.length - 1 && <><circle cx={point.x} cy={point.y} r="8" className="sales-point-ring"/><rect x={point.x - 38} y={point.y - 36} width="62" height="24" rx="6" className="value-tag"/><text x={point.x - 7} y={point.y - 20} textAnchor="middle" className="value-tag-text">₽ {point.value.toLocaleString('ru-RU', {maximumFractionDigits: 1})} млн</text></>}
      </g>)}
      {coords.map((point) => <text key={`x-${point.label}`} x={point.x} y={height - 10} textAnchor="middle" className="axis-text x-axis-text">{point.label}</text>)}
    </svg>
  </div>;
}
