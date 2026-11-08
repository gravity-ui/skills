// timeseriesEngine.js — плотный временной ряд мониторинга
const TimeseriesEngine = (() => {
  const GRID_COLOR = '#2d3748';
  const AXIS_COLOR = '#a0aec0';
  const SERIES_COLORS = ['#68d391', '#f6e05e', '#fc8181', '#63b3ed', '#b794f4'];
  const BG = '#1a202c';
  const PAD = { top: 28, right: 20, bottom: 48, left: 60 };

  function draw(ctx, width, height, data, title) {
    ctx.clearRect(0, 0, width, height);
    const w = width - PAD.left - PAD.right;
    const h = height - PAD.top - PAD.bottom;
    if (w <= 0 || h <= 0 || !data.length) return;

    // фон
    ctx.fillStyle = BG; ctx.fillRect(0, 0, width, height);

    const series = data[0]?.series ? data : [{ name: title, points: data }];
    const allValues = series.flatMap(s => s.points.map(p => p.value));
    const maxVal = Math.max(...allValues) * 1.15 || 1;
    const minVal = Math.min(...allValues, 0) * 0.95;
    const range = maxVal - minVal || 1;
    const pointCount = series[0]?.points.length || 0;
    const xStep = pointCount > 1 ? w / (pointCount - 1) : w;

    // вертикальная сетка (каждый 5-й)
    ctx.strokeStyle = GRID_COLOR; ctx.lineWidth = 0.5;
    for (let i = 0; i < pointCount; i += Math.max(1, Math.floor(pointCount / 12))) {
      const x = PAD.left + xStep * i;
      ctx.beginPath(); ctx.moveTo(x, PAD.top); ctx.lineTo(x, PAD.top + h); ctx.stroke();
    }

    // горизонтальная сетка
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      const y = PAD.top + (h / 8) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + w, y); ctx.stroke();
      const lbl = (maxVal - (range / 8) * i).toFixed(0);
      ctx.fillStyle = AXIS_COLOR; ctx.font = '10px monospace'; ctx.textAlign = 'right';
      ctx.fillText(lbl, PAD.left - 8, y + 4);
    }

    // ряды
    series.forEach((s, si) => {
      const color = SERIES_COLORS[si % SERIES_COLORS.length];
      ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.lineJoin = 'round';
      ctx.beginPath();
      s.points.forEach((p, i) => {
        const x = PAD.left + xStep * i;
        const y = PAD.top + h - ((p.value - minVal) / range) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // подпись ряда
      const last = s.points[s.points.length - 1];
      const lx = PAD.left + xStep * (s.points.length - 1) + 6;
      const ly = PAD.top + h - ((last.value - minVal) / range) * h + 4;
      ctx.fillStyle = color; ctx.font = 'bold 11px monospace';
      ctx.fillText(s.name || `Series-${si + 1}`, lx, ly);
    });

    // метки времени (каждые ~12 точек)
    const pts0 = series[0]?.points || [];
    const step = Math.max(1, Math.floor(pts0.length / 12));
    pts0.forEach((p, i) => {
      if (i % step !== 0) return;
      const x = PAD.left + xStep * i;
      ctx.fillStyle = AXIS_COLOR; ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillText(p.ts || i, x, PAD.top + h + 14);
    });

    // заголовок
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(title, PAD.left, 16);
  }

  return { render: draw };
})();
