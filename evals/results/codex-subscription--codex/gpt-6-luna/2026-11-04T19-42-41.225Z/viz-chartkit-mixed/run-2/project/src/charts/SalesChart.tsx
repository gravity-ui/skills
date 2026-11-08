import type {ChartProps} from '../App';

export default function SalesChart({data}: ChartProps) {
  const w = 900, h = 250, left = 48, right = 14, top = 15, bottom = 25;
  const values = data.map(p => p.value), min = 250, max = 680;
  const x = (i: number) => left + i * (w - left - right) / (data.length - 1);
  const y = (v: number) => top + (max - v) * (h - top - bottom) / (max - min);
  const path = data.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
  const area = `${path} L${x(data.length - 1)},${h - bottom} L${x(0)},${h - bottom} Z`;
  return <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Линейный график продаж за июнь">
    <defs><linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7659e8" stopOpacity=".16"/><stop offset="100%" stopColor="#7659e8" stopOpacity="0"/></linearGradient></defs>
    {[300, 400, 500, 600].map(v => <g key={v}><line x1={left} x2={w - right} y1={y(v)} y2={y(v)} className="grid-line"/><text x="0" y={y(v) + 4} className="axis-label">{v}</text></g>)}
    <path d={area} fill="url(#sales-fill)"/><path d={path} className="sales-line"/>
    {data.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.value)} r={i === data.length - 1 ? 5 : 2.7} className={i === data.length - 1 ? 'sales-point current' : 'sales-point'}/>)}
    <line x1={x(data.length - 1)} x2={x(data.length - 1)} y1={y(values.at(-1)!)} y2={h - bottom} className="current-guide"/>
    <g className="point-label" transform={`translate(${x(data.length - 1) - 54} ${y(values.at(-1)!) - 37})`}><rect width="74" height="25" rx="6"/><text x="37" y="17" textAnchor="middle">612 тыс. ₽</text></g>
  </svg>;
}
