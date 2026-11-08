import { useEffect, useRef, useState } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import type { ChartEngineProps, ChartPoint } from '../components/ChartWidget';
export default function MonitoringEngine({ data, height = 300, comparison = true, visible = true, onPointSelect }: ChartEngineProps) {
  const container = useRef<HTMLDivElement>(null);
  const plot = useRef<uPlot>();
  const select = useRef(onPointSelect);
  const points = useRef(data);
  const [hover, setHover] = useState<{ point: ChartPoint; x: number } | null>(null);
  select.current = onPointSelect;
  points.current = data;
  useEffect(() => {
    if (!container.current) return;
    const chart = new uPlot({
      width: container.current.clientWidth, height, padding: [16, 12, 0, 0],
      legend: { show: false },
      cursor: { drag: { x: true, y: false }, points: { size: 6 } },
      scales: { x: { time: true }, y: { range: (_u, min, max) => [Math.max(0, min - 30), max + 30] } },
      axes: [
        { stroke: '#91958d', grid: { show: false }, ticks: { show: false }, border: { show: false }, font: '11px Inter, sans-serif', size: 36, values: (_u, ticks) => ticks.map(t => new Date(t * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })) },
        { stroke: '#91958d', grid: { stroke: '#edf0e9', width: 1, dash: [3, 4] }, ticks: { show: false }, border: { show: false }, font: '11px Inter, sans-serif', size: 58, values: (_u, ticks) => ticks.map(t => `${t} мс`) },
      ],
      series: [{}, { label: 'Время отклика', stroke: '#648f4b', width: 1.2, fill: 'rgba(130,171,99,.10)', show: visible }, { label: 'Прошлый период', stroke: '#bec7b6', width: 1, dash: [4, 4], show: comparison }],
      hooks: { setCursor: [(u) => { const point = points.current[u.cursor.idx ?? -1]; setHover(point && (u.cursor.left ?? -1) >= 0 ? { point, x: Math.min(u.cursor.left! + 65, u.width - 245) } : null); }] },
    }, [data.map(p => p.timestamp / 1000), data.map(p => p.value), data.map(p => p.previous)], container.current);
    plot.current = chart;
    const onClick = () => { const point = points.current[chart.cursor.idx ?? -1]; if (point) select.current?.(point); };
    chart.over.addEventListener('click', onClick);
    const observer = new ResizeObserver(([entry]) => { if (entry.contentRect.width > 0) chart.setSize({ width: entry.contentRect.width, height }); });
    observer.observe(container.current);
    return () => { observer.disconnect(); chart.over.removeEventListener('click', onClick); chart.destroy(); plot.current = undefined; };
  }, [height]);
  useEffect(() => {
    const chart = plot.current;
    if (!chart) return;
    const oldTimes = chart.data[0];
    const fullSpan = oldTimes[oldTimes.length - 1] - oldTimes[0];
    const currentSpan = (chart.scales.x.max ?? 0) - (chart.scales.x.min ?? 0);
    const keepZoom = oldTimes.length === data.length && currentSpan < fullSpan * 0.98;
    chart.setData([data.map(p => p.timestamp / 1000), data.map(p => p.value), data.map(p => p.previous)], !keepZoom);
    if (keepZoom) chart.redraw();
  }, [data]);
  useEffect(() => { plot.current?.setSeries(1, { show: visible }); plot.current?.setSeries(2, { show: comparison }); }, [visible, comparison]);
  return <div className="monitor-chart" onMouseLeave={() => setHover(null)}><div ref={container} />{hover && <div className="chart-tooltip monitor-tooltip" style={{ left: Math.max(0, hover.x) }}><strong>{new Date(hover.point.timestamp).toLocaleTimeString('ru-RU', { timeZone: 'UTC' })} UTC</strong><div><i className="legend-dot" />Время отклика <b>{hover.point.value} мс</b></div>{comparison && <div><i className="legend-dot gray" />Прошлый период <b>{hover.point.previous} мс</b></div>}</div>}</div>;
}
