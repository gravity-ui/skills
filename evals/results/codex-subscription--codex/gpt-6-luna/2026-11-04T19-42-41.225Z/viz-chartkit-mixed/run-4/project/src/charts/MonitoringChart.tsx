import {useEffect, useRef} from 'react';

type Point = {time: string; value: number};

export default function MonitoringChart({data}: {data: Point[]}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const box = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(box.width * ratio);
      canvas.height = Math.round(box.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const w = box.width, h = box.height, left = 50, right = 18, top = 20, bottom = 34;
      const x = (i: number) => left + i * (w - left - right) / (data.length - 1);
      const y = (v: number) => top + (100 - v) * (h - top - bottom) / 100;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      [0, 25, 50, 75, 100].forEach((v) => {
        const yy = y(v); ctx.beginPath(); ctx.moveTo(left, yy); ctx.lineTo(w - right, yy);
        ctx.strokeStyle = '#edf0f5'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#98a1b2'; ctx.fillText(String(v), left - 12, yy + 4);
      });
      const gradient = ctx.createLinearGradient(0, top, 0, h - bottom);
      gradient.addColorStop(0, 'rgba(31, 174, 146, .15)'); gradient.addColorStop(1, 'rgba(31, 174, 146, 0)');
      ctx.beginPath();
      data.forEach((p, i) => i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value)));
      ctx.lineTo(x(data.length - 1), h - bottom); ctx.lineTo(x(0), h - bottom); ctx.closePath();
      ctx.fillStyle = gradient; ctx.fill();
      ctx.beginPath();
      data.forEach((p, i) => i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value)));
      ctx.strokeStyle = '#17a989'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = '#98a1b2';
      ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].forEach((label, i, labels) => ctx.fillText(label, left + i * (w - left - right) / (labels.length - 1), h - 7));
    };
    draw();
    const observer = new ResizeObserver(draw); observer.observe(canvas);
    return () => observer.disconnect();
  }, [data]);
  return <canvas ref={ref} className="chart-canvas" role="img" aria-label="Плотный временной ряд нагрузки CPU за 24 часа"/>;
}
