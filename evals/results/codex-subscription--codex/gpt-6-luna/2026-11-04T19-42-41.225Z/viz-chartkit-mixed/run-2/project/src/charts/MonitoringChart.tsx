import type {ChartProps} from '../App';

export default function MonitoringChart({data}: ChartProps) {
  const w = 900, h = 250, left = 48, right = 14, top = 15, bottom = 25;
  const min = 40, max = 115;
  const x = (i: number) => left + i * (w - left - right) / (data.length - 1);
  const y = (v: number) => top + (max - v) * (h - top - bottom) / (max - min);
  const path = data.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ');
  const area = `${path} L${x(data.length - 1)},${h - bottom} L${x(0)},${h - bottom} Z`;
  return <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Плотный временной ряд времени отклика API">
    <defs><linearGradient id="monitor-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#28a995" stopOpacity=".14"/><stop offset="100%" stopColor="#28a995" stopOpacity="0"/></linearGradient></defs>
    {[50, 70, 90, 110].map(v => <g key={v}><line x1={left} x2={w - right} y1={y(v)} y2={y(v)} className="grid-line"/><text x="0" y={y(v) + 4} className="axis-label">{v}</text></g>)}
    <path d={area} fill="url(#monitor-fill)"/><path d={path} className="monitor-line"/>
    <line x1={left} x2={w - right} y1={y(100)} y2={y(100)} className="threshold-line"/><text x={w - right - 3} y={y(100) - 7} textAnchor="end" className="threshold-label">Порог 100 мс</text>
    <circle cx={x(data.length - 1)} cy={y(data.at(-1)!.value)} r="4.5" className="monitor-point"/>
  </svg>;
}
