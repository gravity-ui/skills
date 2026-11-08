import type {ChartPoint} from '../VisualizationWidget';
export default function MonitoringChart({data}: {data: ChartPoint[]}) {
  const w = 860, h = 280, left = 42, right = 16, top = 14, bottom = 34;
  const x = (i: number) => left + i * (w - left - right) / Math.max(1, data.length - 1);
  const y = (v: number) => top + (h - top - bottom) * (1 - v / 100);
  const line = data.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');
  const memory = data.map((p, i) => {const value = Math.max(8, Math.min(90, p.value * .76 + Math.sin(i / 3) * 8)); return `${i ? 'L' : 'M'} ${x(i)} ${y(value)}`}).join(' ');
  const tickIndexes = [0, Math.floor((data.length-1)/4), Math.floor((data.length-1)/2), Math.floor(3*(data.length-1)/4), data.length-1];
  return <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" role="img" aria-label="Плотный временной ряд мониторинга">
    {[0, 25, 50, 75, 100].map((val) => <g key={val}><line x1={left} x2={w-right} y1={y(val)} y2={y(val)} className="grid-line"/><text x={left-10} y={y(val)+4} textAnchor="end" className="axis-label">{val}%</text></g>)}
    <line x1={left} x2={w-right} y1={y(80)} y2={y(80)} className="threshold-line"/><path d={memory} className="monitor-line secondary-line"/><path d={line} className="monitor-line"/>
    {tickIndexes.map((i) => <text key={i} x={x(i)} y={h-8} textAnchor="middle" className="axis-label">{data[i]?.time}</text>)}
  </svg>;
}
