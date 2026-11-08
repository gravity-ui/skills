import { useEffect, useRef, useState } from "react";
import type { ChartProps } from "../components/Visualization";
export default function MonitoringEngine({
  data,
  comparison,
  color = "#8b68df",
  onHover,
}: ChartProps) {
  const max = Math.max(
    300,
    Math.ceil(
      data.reduce(
        (m, p) => Math.max(m, p.value, comparison ? (p.previous ?? 0) : 0),
        0,
      ) / 100,
    ) * 100,
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const draw = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      const dpr = devicePixelRatio || 1;
      el.width = w * dpr;
      el.height = h * dpr;
      const ctx = el.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const y = (v: number) => h - 28 - (v / max) * (h - 40);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#eeedf1";
      ctx.setLineDash([4, 5]);
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 12 + (i * (h - 40)) / 4);
        ctx.lineTo(w, 12 + (i * (h - 40)) / 4);
        ctx.stroke();
      }
      const render = (previous: boolean) => {
        ctx.beginPath();
        data.forEach((p, i) => {
          const x = (i / Math.max(1, data.length - 1)) * w;
          const yy = y(previous ? (p.previous ?? 0) : p.value);
          i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
        });
        ctx.strokeStyle = previous ? "#b7c3d4" : color;
        ctx.setLineDash(previous ? [4, 4] : []);
        ctx.lineWidth = previous ? 1 : 1.4;
        ctx.stroke();
        if (!previous) {
          ctx.lineTo(w, h - 28);
          ctx.lineTo(0, h - 28);
          ctx.closePath();
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#8b68df35");
          g.addColorStop(1, "#8b68df02");
          ctx.fillStyle = g;
          ctx.fill();
        }
      };
      if (comparison) render(true);
      render(false);
      if (hover !== null) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = color;
        ctx.beginPath();
        const x = (hover / (data.length - 1)) * w;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h - 28);
        ctx.stroke();
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(el);
    return () => observer.disconnect();
  }, [data, comparison, color, hover, max]);
  const point = hover === null ? null : data[hover];
  return (
    <div className="plot-wrap">
      <div className="y-axis">
        {[1, 0.75, 0.5, 0.25, 0]
          .map((r) => `${max * r} мс`)
          .map((s) => (
            <span key={s}>{s}</span>
          ))}
      </div>
      <div className="plot-body">
        <canvas
          ref={canvas}
          className="monitor-canvas"
          role="img"
          aria-label={`Время отклика сервера, ${data.length} точек`}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const i = Math.max(
              0,
              Math.min(
                data.length - 1,
                Math.round(
                  ((e.clientX - r.left) / r.width) * (data.length - 1),
                ),
              ),
            );
            setHover(i);
            onHover?.(data[i]);
          }}
          onMouseLeave={() => {
            setHover(null);
            onHover?.(null);
          }}
        />
        <div className="x-axis">
          {[0, 0.17, 0.34, 0.51, 0.68, 0.85, 1].map((p, i) => (
            <span key={i}>
              {new Date(
                data[Math.round(p * (data.length - 1))].time,
              ).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ))}
        </div>
        {point && (
          <div
            className="chart-tooltip"
            style={{
              left: `${Math.min(76, Math.max(3, (hover! / (data.length - 1)) * 100))}%`,
            }}
          >
            <span>{new Date(point.time).toLocaleTimeString("ru-RU")}</span>
            <strong>{point.value} мс</strong>
          </div>
        )}
      </div>
    </div>
  );
}
