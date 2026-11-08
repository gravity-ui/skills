import type {MonitorEngineProps} from './types';

function fmtTime(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Плотный временной ряд мониторинга — залитая область на SVG. */
export default function MonitorEngine({data, className}: MonitorEngineProps) {
  if (data.length === 0) {
    return <div className={className}>Нет данных мониторинга</div>;
  }

  const w = 600;
  const h = 280;
  const pad = {top: 20, right: 20, bottom: 40, left: 60};
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);

  const range = max - min || 1;

  const xs = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * plotW;
  const ys = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;
  const baseline = pad.top + plotH;

  const areaPoints =
    data.map((d, i) => `${xs(i)},${ys(d.value)}`).join(' ') +
    ` ${pad.left + plotW},${baseline} ${pad.left},${baseline}`;

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{width: '100%', maxWidth: w, font: '11px sans-serif'}}>
        <defs>
          <linearGradient id="monitorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6d5a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ff6d5a" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* оси */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#ccc" />
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#ccc" />

        {/* сетка Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = ys(min + frac * range);
          return (
            <g key={`gy-${frac}`}>
              <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#eee" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fill="#666">
                {(min + frac * range).toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* залитая область */}
        <polygon points={areaPoints} fill="url(#monitorGrad)" stroke="#ff6d5a" strokeWidth={1.2} />

        {/* подписи X — только границы */}
        <text x={pad.left} y={pad.top + plotH + 16} textAnchor="middle" fill="#666">
          {fmtTime(data[0].ts)}
        </text>
        <text x={pad.left + plotW} y={pad.top + plotH + 16} textAnchor="middle" fill="#666">
          {fmtTime(data[data.length - 1].ts)}
        </text>
      </svg>
    </div>
  );
}
