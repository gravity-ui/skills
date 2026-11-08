import {useId, useState} from 'react';
import type {ChartEngineProps} from './types';

export default function SalesEngine({data, comparison, color, formatValue}: ChartEngineProps) {
  const [hover, setHover] = useState<number | null>(null);
  const gradient = useId().replace(/:/g, '');
  const width = 1000, height = 245, top = 18, bottom = 222;
  const max = Math.max(25000, Math.ceil(data.reduce((max, d) => Math.max(max, d.value, comparison ? d.comparison : 0), 0) / 25000) * 25000);
  const x = (i: number) => 8 + i / Math.max(1, data.length - 1) * 982;
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const points = data.map((d, i) => [x(i), y(d.value)]);
  function smooth(pts: number[][]) {
    return pts.reduce((path, p, i) => {
      if (!i) return `M ${p[0]},${p[1]}`;
      const prev = pts[i - 1];
      const mid = (prev[0] + p[0]) / 2;
      return `${path} C ${mid},${prev[1]} ${mid},${p[1]} ${p[0]},${p[1]}`;
    }, '');
  }
  const line = smooth(points);
  const active = hover === null ? null : data[hover];
  return <div className="sales-engine" data-engine="svg">
    <div className="chart-y-labels">{[1, .75, .5, .25, 0].map(v => <span key={v}>{Math.round(max * v / 1000)} тыс.</span>)}</div>
    <div className="svg-plot" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Линейный график выручки за выбранный период" onMouseMove={e => {const box = e.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(data.length - 1, Math.round((e.clientX - box.left) / box.width * (data.length - 1)))));}}>
        <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".15"/><stop offset="100%" stopColor={color} stopOpacity=".005"/></linearGradient></defs>
        {[0, .25, .5, .75, 1].map(v => <line key={v} x1="0" x2="1000" y1={y(max * v)} y2={y(max * v)} stroke="#eaece9" strokeDasharray="3 5" vectorEffect="non-scaling-stroke"/>)}
        <path d={`${line} L ${x(data.length - 1)},${bottom} L ${x(0)},${bottom} Z`} fill={`url(#${gradient})`}/>
        {comparison && <path d={smooth(data.map((d, i) => [x(i), y(d.comparison)]))} fill="none" stroke="#bdc2bc" strokeWidth="2" strokeDasharray="5 6" vectorEffect="non-scaling-stroke"/>}
        <path d={line} fill="none" stroke={color} strokeWidth="2.7" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
        {active && <><line x1={x(hover!)} x2={x(hover!)} y1={top} y2={bottom} stroke="#e2a447" strokeDasharray="3 4"/><circle cx={x(hover!)} cy={y(active.value)} r="5" fill={color} stroke="white" strokeWidth="3" vectorEffect="non-scaling-stroke"/></>}
      </svg>
      {active && <div className="chart-tooltip" style={{left: `${Math.min(78, Math.max(1, hover! / (data.length - 1) * 100))}%`}}><span>{new Date(active.timestamp).toLocaleDateString('ru-RU', {timeZone: 'Europe/Moscow', day: 'numeric', month: 'long'})}</span><strong><i style={{background: color}}/>{formatValue(active.value)}</strong>{comparison && <small>Предыдущий период: {formatValue(active.comparison)}</small>}</div>}
      <div className="chart-x-labels">{Array.from({length: 7}, (_, i) => data[Math.round(i * (data.length - 1) / 6)]).map((d, i) => <span key={i}>{new Date(d.timestamp).toLocaleDateString('ru-RU', {timeZone: 'Europe/Moscow', day: 'numeric', month: 'short'}).replace('.', '')}</span>)}</div>
    </div>
  </div>;
}
