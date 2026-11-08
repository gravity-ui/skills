type Point = {time: string; value: number};

export default function SalesChart({data}: {data: Point[]}) {
  const width = 900, height = 270;
  const left = 50, right = 18, top = 20, bottom = 34;
  const x = (i: number) => left + i * (width - left - right) / (data.length - 1);
  const y = (value: number) => top + (100 - value) * (height - top - bottom) / 100;
  const line = data.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');
  const area = `${line} L ${x(data.length - 1)} ${height - bottom} L ${x(0)} ${height - bottom} Z`;
  return <svg className="chart-svg sales-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Линейный график выручки по дням">
    <defs><linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#735cf4" stopOpacity=".17"/><stop offset="100%" stopColor="#735cf4" stopOpacity="0"/></linearGradient></defs>
    {[0, 25, 50, 75, 100].map((v) => <g key={v}><line x1={left} x2={width - right} y1={y(v)} y2={y(v)} className="grid-line"/><text x={left - 12} y={y(v) + 4} textAnchor="end" className="axis-label">{v}</text></g>)}
    <path d={area} fill="url(#sales-fill)"/><path d={line} className="sales-line"/>
    {data.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.value)} r="3" className="sales-point"/>)}
    {data.filter((_, i) => i % 2 === 0).map((p) => {const i = data.indexOf(p); return <text key={i} x={x(i)} y={height - 7} textAnchor="middle" className="axis-label">{p.time}</text>;})}
  </svg>;
}
