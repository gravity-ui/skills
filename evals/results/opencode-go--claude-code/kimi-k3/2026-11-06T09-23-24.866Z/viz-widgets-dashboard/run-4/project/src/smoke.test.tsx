import {describe, expect, it} from 'vitest';
import {renderToString} from 'react-dom/server';
import {ThemeProvider} from '@gravity-ui/uikit';
import {App} from './App';
import {categorySales, channelShares, dailySeries, kpiData, niceScale} from './dashboard/data';

describe('App smoke render', () => {
  it('renders the shell without crashing', () => {
    const html = renderToString(
      <ThemeProvider theme="light">
        <App />
      </ThemeProvider>,
    );
    expect(html).toContain('Дашборд продаж');
    expect(html).toContain('grid');
  });
});

describe('data generation', () => {
  it('is deterministic and shorter ranges are suffixes of longer ones', () => {
    const s7 = dailySeries('revenue', 7);
    const s30 = dailySeries('revenue', 30);
    expect(s7).toEqual(s30.slice(-7));
    expect(dailySeries('users', 30)).toEqual(dailySeries('users', 30));
  });

  it('produces sane kpi values', () => {
    const k = kpiData('revenue', 30);
    expect(k.value).toBeGreaterThan(0);
    expect(k.spark).toHaveLength(12);
    expect(Math.abs(k.delta)).toBeLessThan(1);
  });

  it('channel shares sum to ~1', () => {
    const shares = channelShares(30);
    const total = shares.reduce((s, p) => s + p.share, 0);
    expect(total).toBeCloseTo(1, 6);
    expect(shares).toHaveLength(4);
  });

  it('categories are ordered and positive', () => {
    const data = categorySales(30);
    expect(data.every((d) => d.value > 0)).toBe(true);
  });

  it('niceScale brackets the data with clean ticks', () => {
    const {lo, hi, ticks} = niceScale(0, 1_230_000, 4);
    expect(lo).toBeLessThanOrEqual(0);
    expect(hi).toBeGreaterThanOrEqual(1_230_000);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    for (const t of ticks) expect(Number.isFinite(t)).toBe(true);
  });
});
