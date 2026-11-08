import {useEffect, useRef, useState} from 'react';
import type {ChartEngineProps, MonitoringPoint} from '../App';

export default function MonitoringChart({data, height, className}: ChartEngineProps) {
  const points = data as MonitoringPoint[];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<{index: number; x: number; y: number} | null>(null);
  const min = 20;
  const max = 100;
  const pad = {top: 22, right: 18, bottom: 38, left: 54};

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(height * ratio);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const width = rect.width;
      const plotWidth = width - pad.left - pad.right;
      const plotHeight = height - pad.top - pad.bottom;
      const yFor = (value: number) => pad.top + (1 - (value - min) / (max - min)) * plotHeight;

      context.clearRect(0, 0, width, height);
      context.font = '11px Inter, sans-serif';
      context.textAlign = 'right';
      context.textBaseline = 'middle';
      for (let tick = 20; tick <= 100; tick += 20) {
        const y = yFor(tick);
        context.beginPath(); context.moveTo(pad.left, y); context.lineTo(width - pad.right, y);
        context.strokeStyle = '#eeeef2'; context.lineWidth = 1; context.setLineDash([]); context.stroke();
        context.fillStyle = '#9899a6'; context.fillText(`${tick}%`, pad.left - 12, y);
      }
      const thresholdY = yFor(80);
      context.beginPath(); context.moveTo(pad.left, thresholdY); context.lineTo(width - pad.right, thresholdY);
      context.strokeStyle = '#f2a45c'; context.lineWidth = 1.3; context.setLineDash([5, 5]); context.stroke(); context.setLineDash([]);

      const xFor = (index: number) => pad.left + (index / Math.max(1, points.length - 1)) * plotWidth;
      context.beginPath();
      points.forEach((point, index) => {
        const x = xFor(index); const y = yFor(point.value);
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.lineTo(xFor(points.length - 1), height - pad.bottom); context.lineTo(pad.left, height - pad.bottom); context.closePath();
      const fill = context.createLinearGradient(0, pad.top, 0, height - pad.bottom);
      fill.addColorStop(0, 'rgba(39, 164, 143, .16)'); fill.addColorStop(1, 'rgba(39, 164, 143, 0)');
      context.fillStyle = fill; context.fill();

      context.beginPath();
      points.forEach((point, index) => {
        const x = xFor(index); const y = yFor(point.value);
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      });
      context.strokeStyle = '#21a88f'; context.lineWidth = 1.5; context.lineJoin = 'round'; context.lineCap = 'round'; context.stroke();
      if (hover) {
        const point = points[hover.index];
        if (point) {
          const x = xFor(hover.index); const y = yFor(point.value);
          context.beginPath(); context.moveTo(x, pad.top); context.lineTo(x, height - pad.bottom);
          context.strokeStyle = 'rgba(43, 54, 73, .25)'; context.lineWidth = 1; context.stroke();
          context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fillStyle = '#fff'; context.fill(); context.strokeStyle = '#169d85'; context.lineWidth = 2; context.stroke();
        }
      }

      context.textAlign = 'center'; context.textBaseline = 'alphabetic'; context.fillStyle = '#9899a6';
      const labels = ['14:00', '18:00', '22:00', '02:00', '06:00', '10:00'];
      labels.forEach((label, index) => context.fillText(label, pad.left + (index / (labels.length - 1)) * plotWidth, height - 10));
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [height, points, hover]);

  const handleMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const plotWidth = rect.width - pad.left - pad.right;
    const bounded = Math.max(0, Math.min(plotWidth, localX - pad.left));
    const index = Math.round((bounded / plotWidth) * (points.length - 1));
    setHover({index, x: localX, y: event.clientY - rect.top});
  };
  const point = hover ? points[hover.index] : null;
  return <div className={`engine-wrap monitoring-wrap ${className ?? ''}`}>
    <canvas ref={canvasRef} className="monitor-canvas" style={{height}} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} aria-label="Плотный временной ряд загрузки CPU" role="img" />
    {point && <div className="monitor-tooltip" style={{left: `calc(${(hover!.x / (canvasRef.current?.clientWidth || 1)) * 100}% + 12px)`, top: Math.max(8, hover!.y - 44)}}><span className="tooltip-time">{new Date(point.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}</span><strong>{point.value.toFixed(1)}%</strong><span className="tooltip-label">Загрузка CPU</span></div>}
    <span className="threshold-label">80% порог</span>
  </div>;
}
