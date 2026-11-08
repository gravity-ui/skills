function trim1(v: number): string {
  const r = v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
  return r.endsWith('.0') ? r.slice(0, -2) : r;
}

/** Auto-compact for stat tiles / short values: 1,284 · 12.9K · 4.2M */
export function compact(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1e9) return sign + trim1(abs / 1e9) + 'B';
  if (abs >= 1e6) return sign + trim1(abs / 1e6) + 'M';
  if (abs >= 1e4) return sign + trim1(abs / 1e3) + 'K';
  return n.toLocaleString('en-US', { maximumFractionDigits: abs < 10 ? 1 : 0 });
}

export function full(n: number): string {
  return n.toLocaleString('en-US');
}

/** Axis ticks: in full under 10,000, compact once the axis reaches it. */
export function axisTick(v: number, axisMax: number): string {
  return axisMax >= 10000 ? compact(v) : full(v);
}

export function pct(share: number, digits = 0): string {
  return (share * 100).toFixed(digits) + '%';
}

export function money(n: number): string {
  return '$' + compact(n);
}
