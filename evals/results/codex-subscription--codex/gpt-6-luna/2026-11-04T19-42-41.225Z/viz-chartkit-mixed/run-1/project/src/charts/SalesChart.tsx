import type {ChartPoint} from '../VisualizationWidget';
export default function SalesChart({data}: {data: ChartPoint[]}) {
  const w = 860, h = 280, left = 42, right = 16, top = 14, bottom = 34;
  const max = Math.ceil(Math.max(...data.map((p) => p.value)) / 20) * 20;
  const x = (i: number) => left + i * (w - left - right) / Math.max(1, data.length - 1);
  const y = (v: number) => top + (h - top - bottom) * (1 - v / max);
  const line = data.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');
  const area = `${line} L ${x(data.length - 1)} ${h - bottom} L ${x(0)} ${h - bottom} Z`;
  return <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" role="img" aria-label="Линейный график продаж">
    {[0, .25, .5, .75, 1].map((ratio) => {const val = max * ratio; return <g key={ratio}><line x1={left} x2={w-right} y1={y(val)} y2={y(val)} className="grid-line"/><text x={left-10} y={y(val)+4} textAnchor="end" className="axis-label">{val}</text></g>})}
    <path d={area} className="sales-area"/><path d={line} className="sales-line"/>
    {data.map((p, i) => <g key={`${p.time}-${i}`}><circle cx={x(i)} cy={y(p.value)} r="3.5" className="sales-point"/><title>{p.time}: ₽{p.value} тыс.</title></g>)}
    {data.filter((_, i) => i % 2 === 0 || i === data.length - 1).map((p) => <text key={p.time} x={x(data.indexOf(p))} y={h-8} textAnchor="middle" className="axis-label">{p.time}</text>)}
  </svg>;
}
