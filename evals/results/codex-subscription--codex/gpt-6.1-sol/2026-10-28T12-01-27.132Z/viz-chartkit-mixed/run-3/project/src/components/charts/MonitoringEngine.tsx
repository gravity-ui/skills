import {useEffect, useRef, useState} from 'react';
import type {ChartEngineProps} from './types';

export default function MonitoringEngine({data, comparison, color, formatValue}: ChartEngineProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(100, Math.ceil(data.reduce((max, d) => Math.max(max, d.value, comparison ? d.comparison : 0), 0) / 100) * 100);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const draw = () => {
      const bounds = el.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      el.width = bounds.width * ratio; el.height = bounds.height * ratio;
      const ctx = el.getContext('2d');
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      const w = bounds.width, h = bounds.height, top = 18, bottom = h - 23;
      const y = (v: number) => bottom - v / max * (bottom - top);
      ctx.strokeStyle = '#eaece9'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
      for (let i = 0; i <= 4; i++) {ctx.beginPath(); ctx.moveTo(0, y(max * i / 4)); ctx.lineTo(w, y(max * i / 4)); ctx.stroke();}
      const renderLine = (key: 'value' | 'comparison', stroke: string) => {
        ctx.beginPath();
        // Preserve the min/max envelope when multiple samples share a pixel.
        for (let px = 0; px < w; px++) {
          const start = Math.floor(px / w * data.length), end = Math.max(start + 1, Math.floor((px + 1) / w * data.length));
          let min = Infinity, maxValue = -Infinity;
          for (let i = start; i < end && i < data.length; i++) {min = Math.min(min, data[i][key]); maxValue = Math.max(maxValue, data[i][key]);}
          if (!px) ctx.moveTo(px, y(min)); else ctx.lineTo(px, y(min));
          if (maxValue !== min) ctx.lineTo(px, y(maxValue));
        }
        ctx.strokeStyle = stroke; ctx.lineWidth = key === 'value' ? 1.3 : 1; ctx.setLineDash(key === 'comparison' ? [4, 5] : []); ctx.stroke();
        if (key === 'value') {ctx.lineTo(w, bottom); ctx.lineTo(0, bottom); ctx.closePath(); const gradient = ctx.createLinearGradient(0, top, 0, bottom); gradient.addColorStop(0, '#77a99522'); gradient.addColorStop(1, '#77a99502'); ctx.fillStyle = gradient; ctx.fill();}
      };
      if (comparison) renderLine('comparison', '#c1c7c1');
      renderLine('value', color);
    };
    const observer = new ResizeObserver(draw); observer.observe(el); draw();
    return () => observer.disconnect();
  }, [data, comparison, color, max]);
  const active = hover === null ? null : data[hover];
  return <div className="sales-engine" data-engine="canvas">
    <div className="chart-y-labels">{[1, .75, .5, .25, 0].map(v => <span key={v}>{Math.round(max * v)} мс</span>)}</div>
    <div className="svg-plot" onMouseLeave={() => setHover(null)}>
      <canvas ref={canvas} role="img" aria-label={`Временной ряд мониторинга, ${data.length} точек`} onMouseMove={e => {const r = e.currentTarget.getBoundingClientRect(); setHover(Math.min(data.length - 1, Math.max(0, Math.round((e.clientX - r.left) / r.width * (data.length - 1)))));}}/>
      {active && <><div className="canvas-crosshair" style={{left: `${hover! / (data.length - 1) * 100}%`}}/><div className="chart-tooltip" style={{left: `${Math.min(78, Math.max(1, hover! / (data.length - 1) * 100))}%`}}><span>{new Date(active.timestamp).toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span><strong><i style={{background: color}}/>{formatValue(active.value)}</strong>{comparison && <small>Предыдущий период: {formatValue(active.comparison)}</small>}</div></>}
      <div className="chart-x-labels">{Array.from({length: 7}, (_, i) => data[Math.round(i * (data.length - 1) / 6)]).map((d, i) => <span key={i}>{new Date(d.timestamp).toLocaleTimeString('ru-RU', {timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit'})}</span>)}</div>
    </div>
  </div>;
}
