import type {SalesEngineProps} from './types';

/** Рендерит обычный линейный график на SVG без внешних зависимостей. */
export default function SalesEngine({data, className}: SalesEngineProps) {
  if (data.length === 0) {
    return <div className={className}>Нет данных продаж</div>;
  }

  const w = 600;
  const h = 280;
  const pad = {top: 20, right: 20, bottom: 40, left: 50};
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = 0;

  const xs = (i: number) => pad.left + (i / Math.max(data.length - 1, 1)) * plotW;
  const ys = (v: number) => pad.top + plotH - ((v - min) / (max - min)) * plotH;

  const points = data.map((d, i) => `${xs(i)},${ys(d.value)}`).join(' ');

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{width: '100%', maxWidth: w, font: '11px sans-serif'}}>
        {/* оси */}
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#ccc" />
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#ccc" />

        {/* сетка Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = ys(min + frac * (max - min));
          return (
            <g key={`gy-${frac}`}>
              <line x1={pad.left} y1={y} x2={pad.left + plotW} y2={y} stroke="#eee" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fill="#666">
                {Math.round(min + frac * (max - min)).toLocaleString('ru')}
              </text>
            </g>
          );
        })}

        {/* ломаная */}
        <polyline points={points} fill="none" stroke="#5282ff" strokeWidth={2} />

        {/* точки */}
        {data.map((d, i) => (
          <circle key={`pt-${i}`} cx={xs(i)} cy={ys(d.value)} r={3} fill="#5282ff" />
        ))}

        {/* подписи X */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.floor(data.length / 8));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text key={`xl-${i}`} x={xs(i)} y={pad.top + plotH + 16} textAnchor="middle" fill="#666">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
