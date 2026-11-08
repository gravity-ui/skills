import {ResponsiveContainer, Area, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';
import type {ChartWidgetProps} from '../components/ChartWidget';
export default function SalesEngine({data, height = 310, showGrid = true, unit = '₽'}: ChartWidgetProps) {
  const rows = data.timestamps.map((time, index) => Object.fromEntries([['time', time], ...data.series.map(s => [s.id, s.values[index]])]));
  return <ResponsiveContainer width="100%" height={height}>
    <ComposedChart data={rows} margin={{top: 17, right: 12, bottom: 6, left: 5}}>
      <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#139b7e" stopOpacity={.15}/><stop offset="100%" stopColor="#139b7e" stopOpacity={.015}/></linearGradient></defs>
      {showGrid && <CartesianGrid vertical={false} stroke="#e9eeed" strokeDasharray="4 4"/>}
      <XAxis dataKey="time" axisLine={false} tickLine={false} minTickGap={60} tickMargin={16} tick={{fill:'#8a9392',fontSize:11}} tickFormatter={v => new Date(v * 1000).toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.', '')}/>
      <YAxis axisLine={false} tickLine={false} width={59} tickMargin={12} tick={{fill:'#8a9392',fontSize:11}} tickFormatter={v => `${v / 1000} тыс.`} domain={[0, 'auto']} tickCount={5}/>
      <Tooltip cursor={{stroke:'#81bfb0',strokeDasharray:'4 4'}} content={({active,payload,label}) => active && payload?.length ? <div className="chart-tooltip"><strong>{new Date(Number(label) * 1000).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</strong>{payload.map(p => <div key={String(p.dataKey)}><span style={{background:p.color}}/>{p.name}<b>{Number(p.value).toLocaleString('ru-RU')} {unit}</b></div>)}</div> : null}/>
      {data.series.map((s, i) => i === 0 ? <Area key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={2.7} fill="url(#salesFill)" isAnimationActive={false} activeDot={{r:5,stroke:'#fff',strokeWidth:3}}/> : <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false}/>)}
    </ComposedChart>
  </ResponsiveContainer>;
}
