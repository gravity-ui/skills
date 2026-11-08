import type {ChartEngine} from '../../data/types';

const PAD = {top: 16, right: 16, bottom: 28, left: 48};
const GRID_COLOR = '#e0e0e0';
const SERIES_COLOR = '#ff7043';
const ALERT_COLOR = '#d32f2f';
const TEXT_COLOR = '#888';

const engine: ChartEngine = {
  render(svg, data) {
    const {monitor} = data;
    if (!monitor.length) return;

    const w = svg.clientWidth || 600;
    const h = svg.clientHeight || 340;
    const px = PAD.left;
    const py = PAD.top;
    const cw = w - PAD.left - PAD.right;
    const ch = h - PAD.top - PAD.bottom;

    const values = monitor.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const yr = (max - min) || 1;

    const xs = (i: number) => px + (i / (monitor.length - 1 || 1)) * cw;
    const ys = (v: number) => py + ch - ((v - min) / yr) * ch;

    const pts = monitor.map((d, i) => `${xs(i)},${ys(d.value)}`).join(' ');

    svg.innerHTML = `
      <style>
        .mgrid line, .mgrid path { stroke: ${GRID_COLOR}; shape-rendering: crispEdges; }
        .mtick text { font-size: 10px; fill: ${TEXT_COLOR}; }
        .monitor-line { fill: none; stroke: ${SERIES_COLOR}; stroke-width: 1.2; stroke-linejoin: round; }
      </style>
      <g class="mgrid"></g>
      <polyline class="monitor-line" points="${pts}"/>
      <g class="alerts"></g>
    `;

    // grid
    const grid = svg.querySelector('.mgrid')!;
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = py + (ch / steps) * i;
      grid.innerHTML += `<line x1="${px}" y1="${y}" x2="${px + cw}" y2="${y}"/>`;
      const val = (min + (yr / steps) * (steps - i)).toFixed(1);
      grid.innerHTML += `<text class="mtick" x="${px - 6}" y="${y + 4}" text-anchor="end">${val}</text>`;
    }

    // time labels — every N points
    const step = Math.max(1, Math.floor(monitor.length / 6));
    for (let i = 0; i < monitor.length; i += step) {
      const d = new Date(monitor[i].ts);
      const label = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      grid.innerHTML += `<text class="mtick" x="${xs(i)}" y="${py + ch + 16}" text-anchor="middle">${label}</text>`;
    }

    // alert dots
    const alerts = svg.querySelector('.alerts')!;
    for (let i = 0; i < monitor.length; i++) {
      if (monitor[i].alert) {
        alerts.innerHTML += `<circle cx="${xs(i)}" cy="${ys(monitor[i].value)}" r="4" fill="${ALERT_COLOR}" opacity="0.85"/>`;
      }
    }
  },

  destroy(svg) {
    svg.innerHTML = '';
  },
};

export default engine;
