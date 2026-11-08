import { useId } from 'react';
import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartEngineProps, ChartPoint } from '../components/ChartWidget';
const date = (n: number) => new Date(n).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
export default function SalesEngine({ data, height = 300, comparison = true, visible = true, onPointSelect }: ChartEngineProps) {
  const id = useId().replace(/:/g, '');
  return <ResponsiveContainer width="100%" height={height}>
    <ComposedChart data={data} margin={{ top: 15, right: 8, left: 0, bottom: 4 }} onClick={(e) => { const point = data[Number(e.activeTooltipIndex)]; if (point) onPointSelect?.(point); }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#92b975" stopOpacity={0.22} /><stop offset="100%" stopColor="#92b975" stopOpacity={0.015} /></linearGradient></defs>
      <CartesianGrid vertical={false} stroke="#edf0e9" strokeDasharray="3 4" />
      <XAxis dataKey="timestamp" tickFormatter={date} axisLine={false} tickLine={false} minTickGap={65} tick={{ fill: '#91958d', fontSize: 11 }} tickMargin={15} />
      <YAxis axisLine={false} tickLine={false} width={58} tickCount={5} tickFormatter={(n: number) => n === 0 ? '0' : `${n / 1000} тыс.`} tick={{ fill: '#91958d', fontSize: 11 }} />
      <Tooltip cursor={{ stroke: '#8da283', strokeDasharray: '4 4' }} content={({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const point = payload[0].payload as ChartPoint;
        return <div className="chart-tooltip"><strong>{date(point.timestamp)} 2026</strong>{visible && <div><i className="legend-dot" />Выручка <b>{point.value.toLocaleString('ru-RU')} ₽</b></div>}{comparison && <div><i className="legend-dot gray" />Прошлый период <b>{point.previous.toLocaleString('ru-RU')} ₽</b></div>}</div>;
      }} />
      {comparison && <Line dataKey="previous" type="monotone" stroke="#c3c9bd" strokeWidth={1.8} strokeDasharray="5 5" dot={false} isAnimationActive={false} />}
      {visible && <Area type="monotone" dataKey="value" stroke="#648f4b" strokeWidth={2.6} fill={`url(#${id})`} activeDot={{ r: 5, fill: '#648f4b', stroke: '#fff', strokeWidth: 3 }} animationDuration={600} />}
    </ComposedChart>
  </ResponsiveContainer>;
}
