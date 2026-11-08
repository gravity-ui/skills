import type {ChartEngine} from '../../data/types';

const PAD = {top: 24, right: 24, bottom: 36, left: 56};
const GRID_COLOR = '#e8e8e8';
const LINE_COLOR = '#5282ff';
const AREA_COLOR = 'rgba(82,130,255,0.12)';
const TEXT_COLOR = '#555';

const engine: ChartEngine = {
  render(svg, data) {
    const {line} = data;
    if (!line.length) return;

    const w = svg.clientWidth || 600;
    const h = svg.clientHeight || 340;
    const px = PAD.left;
    const py = PAD.top;
    const cw = w - PAD.left - PAD.right;
    const ch = h - PAD.top - PAD.bottom;

    const max = Math.max(...line.map(d => d.value));
    const yRange = max || 1;

    const xs = (i: number) => px + (i / (line.length - 1 || 1)) * cw;
    const ys = (v: number) => py + ch - (v / yRange) * ch;

    // area path
    const area = line.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(d.value)}`).join(' ');
    const areaFull = `${area} L${xs(line.length - 1)},${py + ch} L${xs(0)},${py + ch} Z`;

    // line path
    const path = line.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i)},${ys(d.value)}`).join(' ');

    svg.innerHTML = `
      <style>
        .grid line, .grid path { stroke: ${GRID_COLOR}; shape-rendering: crispEdges; }
        .tick text { font-size: 11px; fill: ${TEXT_COLOR}; }
      </style>
      <g class="grid"></g>
      <path d="${areaFull}" fill="${AREA_COLOR}" stroke="none"/>
      <path d="${path}" fill="none" stroke="${LINE_COLOR}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    `;

    // grid
    const grid = svg.querySelector('.grid')!;
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const y = py + (ch / steps) * i;
      grid.innerHTML += `<line x1="${px}" y1="${y}" x2="${px + cw}" y2="${y}"/>`;
      const val = Math.round(yRange - (yRange / steps) * i);
      grid.innerHTML += `<text class="tick" x="${px - 8}" y="${y + 4}" text-anchor="end">${val}</text>`;
    }

    // x‑labels
    for (let i = 0; i < line.length; i++) {
      grid.innerHTML += `<text class="tick" x="${xs(i)}" y="${py + ch + 18}" text-anchor="middle">${line[i].label}</text>`;
    }

    // dots
    let dots = '';
    for (let i = 0; i < line.length; i++) {
      dots += `<circle cx="${xs(i)}" cy="${ys(line[i].value)}" r="3" fill="white" stroke="${LINE_COLOR}" stroke-width="2"/>`;
    }
    svg.insertAdjacentHTML('beforeend', dots);
  },

  destroy(svg) {
    svg.innerHTML = '';
  },
};

export default engine;
