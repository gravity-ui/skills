import type {ModeConfig, WidgetMode, WidgetSeries} from './types';

/* ── детерминированный PRNG, чтобы демо-данные стабильны между рендерами ── */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ─────────────────────────── режим «Продажи» ─────────────────────────── */

/** Выручка по месяцам, млн ₽ — скользящие 12 месяцев (ноя 2025 — окт 2026). */
const SALES_VALUES = [820, 760, 940, 1010, 980, 1120, 1240, 1190, 1310, 1450, 1620, 1780];

function buildSalesSeries(): WidgetSeries[] {
  const start = new Date(2025, 10, 1); // 1 ноября 2025, локальное время
  return [
    {
      id: 'revenue',
      name: 'Выручка',
      colorSlot: 1,
      points: SALES_VALUES.map((v, i) => ({
        t: new Date(start.getFullYear(), start.getMonth() + i, 1).getTime(),
        v,
      })),
    },
  ];
}

/* ───────────────────────── режим «Мониторинг» ───────────────────────── */

const MINUTE = 60_000;
const DAY_START = new Date(2026, 10, 5, 0, 0, 0).getTime(); // 5 ноября 2026
const POINTS_PER_DAY = 24 * 60;

function buildMonitoringSeries(): WidgetSeries[] {
  const rand = mulberry32(20261105);

  const cpu: {t: number; v: number}[] = [];
  const mem: {t: number; v: number}[] = [];
  let cpuNoise = 0;
  let memNoise = 0;

  for (let m = 0; m < POINTS_PER_DAY; m++) {
    const t = DAY_START + m * MINUTE;
    const hour = m / 60;

    // CPU: суточная волна (пик ~15:00) + сглаженный шум + инцидент-всплеск в 13:40
    cpuNoise = cpuNoise * 0.82 + (rand() - 0.5) * 9;
    const wave = 18 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    const minutesAfterSpike = m - (13 * 60 + 40);
    const spike =
      minutesAfterSpike >= 0 ? 34 * Math.exp(-minutesAfterSpike / 26) : 0;
    cpu.push({t, v: clamp(34 + wave + cpuNoise + spike, 2, 99)});

    // Память: медленный рост за сутки + лёгкий шум
    memNoise = memNoise * 0.9 + (rand() - 0.5) * 3;
    mem.push({t, v: clamp(52 + m * 0.012 + 3 * Math.sin((hour / 24) * 2 * Math.PI) + memNoise, 30, 95)});
  }

  return [
    {id: 'cpu', name: 'CPU', colorSlot: 1, points: cpu},
    {id: 'mem', name: 'Память', colorSlot: 2, points: mem},
  ];
}

/* ─────────────────────────── форматтеры ─────────────────────────── */

const monthFmt = new Intl.DateTimeFormat('ru-RU', {month: 'short', year: '2-digit'});
const timeFmt = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});

const formatMillions = (v: number) => `${v.toLocaleString('ru-RU')} млн ₽`;
const formatPercent = (v: number) => `${Math.round(v)} %`;

/* ───────────────────── собранная конфигурация режимов ───────────────────── */

export function buildDemoModes(): Record<WidgetMode, ModeConfig> {
  return {
    sales: {
      label: 'Продажи',
      series: buildSalesSeries(),
      formatValue: formatMillions,
      formatTime: (t) => monthFmt.format(new Date(t)),
      ariaLabel: 'Линейный график выручки по месяцам за последние 12 месяцев',
    },
    monitoring: {
      label: 'Мониторинг',
      series: buildMonitoringSeries(),
      formatValue: formatPercent,
      formatTime: (t) => timeFmt.format(new Date(t)),
      ariaLabel: 'Плотный временной ряд загрузки CPU и памяти за сутки, поминутно',
      tableSample: 15, // в таблице — каждая 15-я минута
    },
  };
}
