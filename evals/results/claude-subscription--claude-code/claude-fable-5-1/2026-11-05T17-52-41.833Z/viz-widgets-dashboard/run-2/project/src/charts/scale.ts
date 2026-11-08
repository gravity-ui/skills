/** Округлённый максимум и «красивые» деления оси. */
export function niceTicks(max: number, count = 4): { ticks: number[]; max: number } {
  if (max <= 0) return { ticks: [0, 1], max: 1 };
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * power);
  const step = candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(10)));
  return { ticks, max: top };
}

const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

/** Подписи оси: полностью до 10 000, компактно выше, один стиль на ось. */
export function axisFormatter(max: number): (value: number) => string {
  return max >= 10_000 ? (v) => compact.format(v) : (v) => full.format(v);
}

/** Индексы точек для подписей оси X, равномерно и всегда с первой и последней. */
export function pickTickIndexes(count: number, desired = 5): number[] {
  if (count <= desired) return Array.from({ length: count }, (_, i) => i);
  const step = (count - 1) / (desired - 1);
  const set = new Set<number>();
  for (let i = 0; i < desired; i += 1) set.add(Math.round(i * step));
  return [...set];
}
