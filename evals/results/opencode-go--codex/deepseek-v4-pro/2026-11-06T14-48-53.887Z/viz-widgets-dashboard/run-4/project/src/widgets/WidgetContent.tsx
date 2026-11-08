import { WidgetDef } from './types';

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  return `hsl(${h}, 60%, 70%)`;
}

function svgChart(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * width},${height - (v / max) * height}`)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={pts}
        fill="none"
        stroke="var(--g-color-base-brand, #5282ff)"
        strokeWidth={2}
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i / (values.length - 1)) * width}
          cy={height - (v / max) * height}
          r={3}
          fill="var(--g-color-base-brand, #5282ff)"
        />
      ))}
    </svg>
  );
}

function svgBar(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const barW = width / values.length - 4;
  const colors = values.map(() => randomColor());
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {values.map((v, i) => (
        <rect
          key={i}
          x={i * (barW + 4) + 2}
          y={height - (v / max) * height}
          width={barW}
          height={(v / max) * height}
          fill={colors[i]}
          rx={3}
        />
      ))}
    </svg>
  );
}

function svgDonut(percent: number, size: number) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#eee"
        strokeWidth={size * 0.12}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--g-color-base-brand, #5282ff)"
        strokeWidth={size * 0.12}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.22}
        fontWeight={700}
      >
        {percent}%
      </text>
    </svg>
  );
}

export function WidgetContent({ widget }: { widget: WidgetDef }) {
  switch (widget.id) {
    case 'chart':
      return (
        <div style={{ padding: 8, height: '100%', boxSizing: 'border-box' }}>
          {svgChart([10, 25, 18, 40, 32, 55, 48, 70, 60, 82], 380, 180)}
        </div>
      );
    case 'bars':
      return (
        <div style={{ padding: 8, height: '100%', boxSizing: 'border-box' }}>
          {svgBar([42, 58, 35, 72, 50, 68], 380, 180)}
        </div>
      );
    case 'donut':
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          {svgDonut(74, 160)}
        </div>
      );
    case 'stats':
      return (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--g-color-text-primary)' }}>
            12,847
          </div>
          <div style={{ color: 'var(--g-color-text-secondary)', marginTop: 4 }}>
            Active users today
          </div>
          <div style={{ marginTop: 12, color: 'var(--g-color-text-positive)' }}>
            ↑ 12.5% vs last week
          </div>
        </div>
      );
    case 'tasks':
      return (
        <div style={{ padding: 16 }}>
          {[
            { t: 'Deploy v2.3.1', done: true },
            { t: 'Review pull requests', done: true },
            { t: 'Update dependencies', done: false },
            { t: 'Write integration tests', done: false },
            { t: 'Team sync meeting', done: false },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 0',
                color: item.done ? 'var(--g-color-text-secondary)' : 'var(--g-color-text-primary)',
                textDecoration: item.done ? 'line-through' : 'none',
              }}
            >
              <span>{item.done ? '✓' : '○'}</span>
              {item.t}
            </div>
          ))}
        </div>
      );
    case 'table':
      return (
        <div style={{ padding: 8, fontSize: 13 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--g-color-line-generic)' }}>
                <th style={{ textAlign: 'left', padding: 4 }}>Name</th>
                <th style={{ textAlign: 'right', padding: 4 }}>CPU</th>
                <th style={{ textAlign: 'right', padding: 4 }}>Mem</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['web-01', '23%', '1.2 GB'],
                ['web-02', '41%', '2.8 GB'],
                ['db-01', '68%', '7.4 GB'],
                ['cache-01', '12%', '0.5 GB'],
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--g-color-line-generic)' }}>
                  <td style={{ padding: 4 }}>{r[0]}</td>
                  <td style={{ textAlign: 'right', padding: 4 }}>{r[1]}</td>
                  <td style={{ textAlign: 'right', padding: 4 }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <div style={{ padding: 16 }}>Unknown widget</div>;
  }
}
