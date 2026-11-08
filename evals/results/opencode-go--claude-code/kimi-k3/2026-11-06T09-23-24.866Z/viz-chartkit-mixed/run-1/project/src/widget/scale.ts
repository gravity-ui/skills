/** Round, clean axis scale shared by both engines. */

function niceStep(rawStep: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  return (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
}

/**
 * Zero-based value scale: picks one nice step, extends the ceiling to a whole
 * number of steps, and returns ticks covering the full domain (0 … yMax
 * inclusive), so the top gridline always carries a label.
 */
export function niceScale(maxValue: number, count = 4): {yMax: number; ticks: number[]} {
  const max = maxValue > 0 ? maxValue : 1;
  const step = niceStep(max / count);
  const yMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= yMax + step * 1e-6; v += step) {
    ticks.push(+v.toPrecision(12));
  }
  return {yMax, ticks};
}
