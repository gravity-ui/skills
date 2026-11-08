import { useTheme } from '@gravity-ui/uikit';
import type { CSSProperties } from 'react';

const points = [
  { month: 'Jan', value: 32 },
  { month: 'Feb', value: 40 },
  { month: 'Mar', value: 36 },
  { month: 'Apr', value: 53 },
  { month: 'May', value: 49 },
  { month: 'Jun', value: 66 },
  { month: 'Jul', value: 61 },
  { month: 'Aug', value: 78 },
  { month: 'Sep', value: 72 },
  { month: 'Oct', value: 89 },
  { month: 'Nov', value: 83 },
  { month: 'Dec', value: 96 },
];

export function App({ onThemeToggle }: { onThemeToggle: () => void }) {
  const theme = useTheme();
  const dark = theme.startsWith('dark');
  const palette = dark
    ? { bg: '#111318', card: '#1a1d24', border: '#2b303b', text: '#f2f4f8', muted: '#9299a8', grid: '#2b303b', accent: '#8b7cff', soft: '#28243d', chip: '#20242c' }
    : { bg: '#f5f6fa', card: '#ffffff', border: '#e7e9f0', text: '#202330', muted: '#858a99', grid: '#eceef4', accent: '#6657e8', soft: '#f0edff', chip: '#f4f5f8' };
  const coords = points.map((point, index) => `${52 + index * 66},${224 - point.value * 1.72}`).join(' ');
  const area = `52,224 ${coords} 778,224`;

  return (
    <main style={{ ...styles.page, background: palette.bg, color: palette.text, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div>
            <div style={{ ...styles.eyebrow, color: palette.muted }}>OVERVIEW <span style={{ margin: '0 9px' }}>·</span> ANALYTICS</div>
            <h1 style={styles.title}>Performance</h1>
            <p style={{ ...styles.subtitle, color: palette.muted }}>Track how your business is growing over time.</p>
          </div>
          <button type="button" onClick={onThemeToggle} style={{ ...styles.themeBadge, background: palette.card, borderColor: palette.border, color: palette.muted, cursor: 'pointer', font: 'inherit' }} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>
            <span style={{ ...styles.themeDot, background: dark ? '#9d91ff' : '#f2b34b' }} />
            {dark ? 'Dark' : 'Light'} theme <span style={{ marginLeft: 3, opacity: .7 }}>↔</span>
          </button>
        </header>

        <section style={{ ...styles.card, background: palette.card, borderColor: palette.border }} aria-label="Revenue chart">
          <div style={styles.cardTop}>
            <div>
              <div style={{ ...styles.label, color: palette.muted }}>TOTAL REVENUE</div>
              <div style={styles.metricRow}>
                <strong style={styles.metric}>$48,294</strong>
                <span style={{ ...styles.change, background: dark ? '#20352e' : '#e8f7ef', color: dark ? '#73d5a2' : '#238a58' }}>↗ 12.8%</span>
              </div>
              <div style={{ ...styles.comparison, color: palette.muted }}>Compared to <span style={{ color: palette.text }}>last year</span></div>
            </div>
            <button type="button" style={{ ...styles.select, background: palette.card, borderColor: palette.border, color: palette.text }}>This year <span style={{ color: palette.muted, marginLeft: 18 }}>⌄</span></button>
          </div>

          <div style={styles.chartWrap}>
            <div style={styles.yLabels}>
              {['$10k', '$8k', '$6k', '$4k', '$2k', '$0'].map((label) => <span key={label} style={{ color: palette.muted }}>{label}</span>)}
            </div>
            <svg viewBox="0 0 800 250" preserveAspectRatio="none" role="img" aria-label="Revenue rises overall from January to December, with small dips in March, May, July, September, and November." style={styles.svg}>
              <defs>
                <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={palette.accent} stopOpacity={dark ? '.24' : '.16'} /><stop offset="100%" stopColor={palette.accent} stopOpacity="0" /></linearGradient>
              </defs>
              {[26, 66, 106, 146, 186, 224].map(y => <line key={y} x1="52" x2="778" y1={y} y2={y} stroke={palette.grid} strokeDasharray="3 5" />)}
              <polygon points={area} fill="url(#chart-fill)" />
              <polyline points={coords} fill="none" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              {points.map((point, index) => <circle key={point.month} cx={52 + index * 66} cy={224 - point.value * 1.72} r={index === 9 ? 5 : 3.5} fill={palette.card} stroke={palette.accent} strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
              <line x1="646" x2="646" y1="26" y2="224" stroke={palette.accent} strokeDasharray="3 5" opacity=".45" />
              <circle cx="646" cy={224 - points[9].value * 1.72} r="8" fill={palette.accent} opacity=".17" />
              <circle cx="646" cy={224 - points[9].value * 1.72} r="4" fill={palette.accent} stroke={palette.card} strokeWidth="2" />
            </svg>
            <div style={styles.xLabels}>{points.map((point, index) => <span key={point.month} style={{ color: palette.muted, fontWeight: index === 9 ? 650 : 400 }}>{point.month}</span>)}</div>
          </div>
          <footer style={{ ...styles.footer, borderColor: palette.border }}>
            <div style={styles.legend}><span style={{ ...styles.legendMark, background: palette.accent }} /> <span style={{ color: palette.text }}>Revenue</span><span style={{ color: palette.muted }}> · Monthly totals</span></div>
            <div style={{ ...styles.period, color: palette.muted }}><span style={{ ...styles.periodDot, background: palette.accent }} /> Peak month <b style={{ color: palette.text }}>October</b></div>
          </footer>
        </section>
        <p style={{ ...styles.note, color: palette.muted }}>Monthly revenue <span style={{ margin: '0 7px' }}>·</span> Jan — Dec 2024</p>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', boxSizing: 'border-box', padding: '72px 28px' },
  shell: { width: 'min(100%, 960px)', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, marginBottom: 34 },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: '1.3px', marginBottom: 12 },
  title: { fontSize: 32, letterSpacing: '-1px', lineHeight: 1.15, margin: 0, fontWeight: 650 },
  subtitle: { margin: '9px 0 0', fontSize: 14 },
  themeBadge: { display: 'flex', alignItems: 'center', gap: 8, border: '1px solid', borderRadius: 20, padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap' },
  themeDot: { width: 7, height: 7, borderRadius: '50%' },
  card: { border: '1px solid', borderRadius: 16, padding: '28px 30px 0', boxShadow: '0 8px 30px rgba(20, 25, 50, .04)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: '1px', marginBottom: 9 },
  metricRow: { display: 'flex', alignItems: 'center', gap: 12 },
  metric: { fontSize: 30, letterSpacing: '-.8px', lineHeight: 1.2 },
  change: { fontSize: 12, fontWeight: 650, borderRadius: 20, padding: '5px 8px' },
  comparison: { fontSize: 12, marginTop: 7 },
  select: { border: '1px solid', borderRadius: 8, padding: '9px 11px', fontSize: 12, cursor: 'default' },
  chartWrap: { position: 'relative', marginTop: 30, paddingLeft: 48, paddingBottom: 31 },
  yLabels: { position: 'absolute', left: 0, top: -7, bottom: 25, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11 },
  svg: { display: 'block', width: '100%', height: 250, overflow: 'visible' },
  xLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 9 },
  footer: { borderTop: '1px solid', display: 'flex', justifyContent: 'space-between', padding: '17px 0', fontSize: 12 },
  legend: { display: 'flex', alignItems: 'center', gap: 7 },
  legendMark: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 2 },
  period: { display: 'flex', alignItems: 'center', gap: 7 },
  periodDot: { width: 6, height: 6, borderRadius: '50%' },
  note: { textAlign: 'center', margin: '18px 0 0', fontSize: 11 },
};
