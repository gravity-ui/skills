// lineChartEngine.js — движок линейного графика продаж
const LineChartEngine = (() => {
  const GRID_COLOR = '#2d3748';
  const AXIS_COLOR = '#a0aec0';
  const LINE_COLOR = '#48bb78';
  const AREA_TOP = 'rgba(72, 187, 120, 0.25)';
  const AREA_BOTTOM = 'rgba(72, 187, 120, 0.02)';
  const POINT_COLOR = '#48bb78';
  const PAD = { top: 24, right: 24, bottom: 48, left: 60 };

  function draw(ctx, width, height, data, title) {
    ctx.clearRect(0, 0, width, height);
    const w = width - PAD.left - PAD.right;
    const h = height - PAD.top - PAD.bottom;
    if (w <= 0 || h <= 0 || data.length < 2) return;

    const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 1;
    const xStep = w / (data.length - 1);

    // сетка
    const gridLines = 5;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridLines; i++) {
      const y = PAD.top + (h / gridLines) * i;
      ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + w, y); ctx.stroke();
      const lbl = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.fillStyle = AXIS_COLOR; ctx.font = '11px monospace'; ctx.textAlign = 'right';
      ctx.fillText(lbl, PAD.left - 8, y + 4);
    }

    // ось X
    data.forEach((d, i) => {
      const x = PAD.left + xStep * i;
      ctx.fillStyle = AXIS_COLOR; ctx.font = '10px monospace'; ctx.textAlign = 'center';
      ctx.fillText(d.label, x, PAD.top + h + 18);
    });

    // заливка
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top + h);
    data.forEach((d, i) => {
      const x = PAD.left + xStep * i;
      const y = PAD.top + h - (d.value / maxVal) * h;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(PAD.left + xStep * (data.length - 1), PAD.top + h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + h);
    grad.addColorStop(0, AREA_TOP); grad.addColorStop(1, AREA_BOTTOM);
    ctx.fillStyle = grad; ctx.fill();

    // линия
    ctx.strokeStyle = LINE_COLOR; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = PAD.left + xStep * i;
      const y = PAD.top + h - (d.value / maxVal) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // точки
    data.forEach(d => {
      const x = PAD.left + xStep * data.indexOf(d);
      const y = PAD.top + h - (d.value / maxVal) * h;
      ctx.fillStyle = POINT_COLOR; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    });

    // заголовок
    ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(title, PAD.left, 18);
  }

  return { render: draw };
})();
