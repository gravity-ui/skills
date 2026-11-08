import type { Order } from './orders';
import { formatCompactMoney, formatInteger, formatMoney, formatPercent, formatSignedPercent, formatSignedPoints } from '../lib/format';

export type DeltaTone = 'good' | 'bad' | 'neutral';

export interface KpiDelta {
  text: string;
  direction: 'up' | 'down' | 'flat';
  tone: DeltaTone;
}

export interface Kpi {
  id: string;
  label: string;
  value: string;
  /** Изменение относительно предыдущих 30 дней; undefined, если сравнивать не с чем. */
  delta?: KpiDelta;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_DAYS = 30;

interface PeriodStats {
  count: number;
  revenue: number;
  averageCheck: number;
  cancelRate: number;
}

function periodStats(orders: Order[], from: number, to: number): PeriodStats {
  let count = 0;
  let paidCount = 0;
  let cancelled = 0;
  let revenue = 0;

  for (const order of orders) {
    const t = order.createdAt.getTime();
    if (t < from || t > to) continue;
    count += 1;
    if (order.status === 'cancelled') {
      cancelled += 1;
      continue;
    }
    paidCount += 1;
    revenue += order.total;
  }

  return {
    count,
    revenue,
    averageCheck: paidCount > 0 ? revenue / paidCount : 0,
    cancelRate: count > 0 ? cancelled / count : 0,
  };
}

function toneFor(direction: KpiDelta['direction'], goodWhenUp: boolean): DeltaTone {
  if (direction === 'flat') return 'neutral';
  return (direction === 'up') === goodWhenUp ? 'good' : 'bad';
}

function relativeDelta(current: number, previous: number, goodWhenUp: boolean): KpiDelta | undefined {
  if (previous === 0) return undefined;
  const change = current / previous - 1;
  const direction = Math.abs(change) < 0.0005 ? 'flat' : change > 0 ? 'up' : 'down';
  return { text: formatSignedPercent(change), direction, tone: toneFor(direction, goodWhenUp) };
}

function pointsDelta(current: number, previous: number, goodWhenUp: boolean): KpiDelta {
  const change = current - previous;
  const direction = Math.abs(change) < 0.0005 ? 'flat' : change > 0 ? 'up' : 'down';
  return { text: formatSignedPoints(change), direction, tone: toneFor(direction, goodWhenUp) };
}

export function computeKpis(orders: Order[], now: Date): Kpi[] {
  const end = now.getTime();
  const middle = end - PERIOD_DAYS * DAY_MS;
  const start = end - 2 * PERIOD_DAYS * DAY_MS;

  const current = periodStats(orders, middle, end);
  const previous = periodStats(orders, start, middle);
  const hasPrevious = previous.count > 0;

  return [
    {
      id: 'revenue',
      label: 'Выручка за 30 дней',
      value: formatCompactMoney(current.revenue),
      delta: hasPrevious ? relativeDelta(current.revenue, previous.revenue, true) : undefined,
    },
    {
      id: 'orders',
      label: 'Заказов за 30 дней',
      value: formatInteger(current.count),
      delta: hasPrevious ? relativeDelta(current.count, previous.count, true) : undefined,
    },
    {
      id: 'average',
      label: 'Средний чек',
      value: formatMoney(current.averageCheck),
      delta: hasPrevious ? relativeDelta(current.averageCheck, previous.averageCheck, true) : undefined,
    },
    {
      id: 'cancels',
      label: 'Доля отмен',
      value: formatPercent(current.cancelRate),
      delta: hasPrevious ? pointsDelta(current.cancelRate, previous.cancelRate, false) : undefined,
    },
  ];
}
