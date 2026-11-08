import {useEffect, useRef} from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import type {ChartWidgetProps} from '../components/ChartWidget';
export default function MonitoringEngine({data, height = 310, showGrid = true, unit = 'мс'}: ChartWidgetProps) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip monitor-tooltip';
    tooltip.style.display = 'none';
    el.appendChild(tooltip);
    const plot = new uPlot({
      width: el.clientWidth, height,
      padding: [18,12,0,2],
      cursor: {drag: {x: true, y: false}},
      legend: {show: false},
      scales: {x: {time: true}, y: {auto: true}},
      series: [{}, ...data.series.map((s, i) => ({label:s.name, stroke:s.color, width:i === 0 ? 1.3 : 1, fill:i === 0 ? 'rgba(19,155,126,.065)' : undefined, dash:s.dashed ? [5,5] : undefined}))],
      axes: [
        {stroke:'#8a9392',font:'11px Inter, sans-serif',grid:{show:false},ticks:{show:false},size:40,values:(_u,ticks) => ticks.map(v => new Date(v*1000).toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'UTC'}))},
        {stroke:'#8a9392',font:'11px Inter, sans-serif',grid:{show:showGrid,stroke:'#e9eeed',dash:[4,4]},ticks:{show:false},size:64,values:(_u,ticks) => ticks.map(v => `${v} ${unit}`)},
      ],
      hooks: {setCursor: [(u) => {
        const idx = u.cursor.idx;
        if (idx == null || (u.cursor.left ?? -1) < 0) {tooltip.style.display='none'; return;}
        tooltip.replaceChildren();
        const title = document.createElement('strong');
        title.textContent = new Date(data.timestamps[idx]*1000).toLocaleTimeString('ru-RU', {timeZone:'UTC'});
        tooltip.appendChild(title);
        data.series.forEach(s => {const row = document.createElement('div'); const dot = document.createElement('span'); dot.style.background=s.color; const value = document.createElement('b'); value.textContent=`${s.values[idx].toFixed(1)} ${unit}`; row.append(dot,document.createTextNode(s.name),value); tooltip.append(row);});
        tooltip.style.display='block';
        tooltip.style.left=`${Math.min(Math.max((u.cursor.left ?? 0)+70, 8), Math.max(8, el.clientWidth-270))}px`;
        tooltip.style.top='22px';
      }]},
    }, [data.timestamps, ...data.series.map(s => s.values)], el);
    const observer = new ResizeObserver(([entry]) => {if(entry.contentRect.width) plot.setSize({width:entry.contentRect.width,height});});
    observer.observe(el);
    return () => {observer.disconnect(); plot.destroy(); tooltip.remove();};
  }, [data,height,showGrid,unit]);
  return <div ref={host} className="monitor-host" style={{height}}/>;
}
