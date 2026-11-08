import { useEffect, useRef, useState } from "react";
import type { ChartProps } from "../components/Visualization";
export default function MonitoringEngine({
  series,
  formatX,
  formatY,
  unit,
}: ChartProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(100);
  const [hover, setHover] = useState<{ index: number; left: number } | null>(
    null,
  );
  const visible = series.map((s) => ({
    ...s,
    data: s.data.slice(-Math.max(30, Math.round((s.data.length * zoom) / 100))),
  }));
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !visible[0]?.data.length) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect(),
        dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      const w = rect.width,
        h = rect.height,
        l = 55,
        r = 20,
        t = 15,
        b = 32;
      const max = Math.max(
        50,
        Math.ceil(
          visible.reduce(
            (max, s) => s.data.reduce((m, p) => Math.max(m, p.y), max),
            0,
          ) / 50,
        ) * 50,
      );
      ctx.font = "11px Inter, sans-serif";
      for (let i = 0; i < 5; i++) {
        const y = h - b - ((h - t - b) * i) / 4;
        ctx.beginPath();
        ctx.strokeStyle = "#ececf1";
        ctx.setLineDash([3, 5]);
        ctx.moveTo(l, y);
        ctx.lineTo(w - r, y);
        ctx.stroke();
        ctx.fillStyle = "#91929e";
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round((max * i) / 4)), l - 12, y + 4);
      }
      visible.forEach((s, si) => {
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = si ? 1.4 : 1.5;
        ctx.setLineDash(s.dashed ? [4, 4] : []);
        s.data.forEach((p, i) => {
          const x = l + (i / (s.data.length - 1 || 1)) * (w - l - r),
            y = h - b - (p.y / max) * (h - t - b);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke();
      });
      ctx.textAlign = "center";
      const ticks = w < 500 ? 3 : 6;
      for (let i = 0; i <= ticks; i++) {
        const idx = Math.round(((visible[0].data.length - 1) * i) / ticks);
        ctx.fillStyle = "#91929e";
        ctx.fillText(
          formatX(visible[0].data[idx].x),
          l + ((w - l - r) * i) / ticks,
          h - 9,
        );
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [series, zoom, formatX]);
  if (!series[0]?.data.length)
    return <div className="chart-loading">Нет данных мониторинга</div>;
  return (
    <div className="monitor-plot">
      <canvas
        ref={ref}
        role="img"
        aria-label={`Мониторинг: ${visible[0].data.length} точек`}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const left = e.clientX - r.left;
          setHover({
            index: Math.max(
              0,
              Math.min(
                visible[0].data.length - 1,
                Math.round(
                  ((left - 55) / (r.width - 75)) * (visible[0].data.length - 1),
                ),
              ),
            ),
            left: (left / r.width) * 100,
          });
        }}
      />
      {hover && (
        <div
          className="plot-tooltip"
          style={{ left: `${Math.min(75, Math.max(6, hover.left))}%`, top: 8 }}
        >
          <b>{formatX(visible[0].data[hover.index].x)}</b>
          {visible.map((s) => (
            <div key={s.id}>
              <span>
                <i style={{ background: s.color }} />
                {s.label}
              </span>
              <strong>
                {formatY(s.data[hover.index].y)} {unit}
              </strong>
            </div>
          ))}
        </div>
      )}
      <div className="zoom-control">
        <span>Масштаб</span>
        <input
          aria-label="Диапазон мониторинга"
          type="range"
          min="5"
          max="100"
          value={zoom}
          onChange={(e) => {
            setHover(null);
            setZoom(+e.target.value);
          }}
        />
        <span>{visible[0].data.length.toLocaleString("ru")} точек</span>
      </div>
    </div>
  );
}
