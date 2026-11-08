import { useState } from 'react';
import { fmt } from '../format';
import { ViewSwitch, type ViewMode } from './ViewSwitch';

interface Region {
  name: string;
  value: number;
  share: number;
}

/**
 * Ranked horizontal bars, one hue, largest first. The value sits in a right-hand column
 * so it never collides with a bar; each row's tooltip is anchored at the bar's end.
 */
export function RegionBars({ regions, total }: { regions: Region[]; total: number }) {
  const [view, setView] = useState<ViewMode>('chart');
  const max = regions[0]?.value || 1;

  return (
    <div className="chart">
      <div className="chart__toolbar">
        <span className="chart__unit">₽ за период</span>
        <ViewSwitch view={view} onChange={setView} />
      </div>

      {view === 'chart' ? (
        <ol className="region-list">
          {regions.map((r) => {
            const pct = r.value / max;
            return (
              <li
                key={r.name}
                className="region-row"
                tabIndex={0}
                aria-label={`${r.name}: ${fmt.moneyFull(r.value)}, ${fmt.sharePct(r.share)} выручки`}
              >
                <span className="region-name">{r.name}</span>
                <span className="region-track">
                  <span className="region-bar" style={{ width: `${pct * 100}%` }} />
                  <span
                    className={pct > 0.6 ? 'viz-tooltip region-tip is-flipped' : 'viz-tooltip region-tip'}
                    style={{ left: `${pct * 100}%` }}
                    aria-hidden="true"
                  >
                    <span className="viz-tooltip__name">{r.name}</span>
                    <span className="viz-tooltip__line">
                      <strong className="viz-tooltip__value">{fmt.moneyFull(r.value)}</strong>
                      <span className="viz-tooltip__name">{fmt.sharePct(r.share)}</span>
                    </span>
                  </span>
                </span>
                <span className="region-value">{fmt.moneyCompact(r.value)}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="table-wrap">
          <table className="data-table" aria-label="Выручка по регионам">
            <thead>
              <tr>
                <th scope="col">Регион</th>
                <th scope="col" className="num">
                  Выручка
                </th>
                <th scope="col" className="num">
                  Доля
                </th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  <td className="num">{fmt.moneyFull(r.value)}</td>
                  <td className="num">{fmt.sharePct(r.share)}</td>
                </tr>
              ))}
              <tr className="data-table__total">
                <td>Итого</td>
                <td className="num">{fmt.moneyFull(total)}</td>
                <td className="num">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
