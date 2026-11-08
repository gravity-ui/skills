import { DataTable } from './DataTable';

export interface BarDatum {
  name: string;
  value: number;
  share: number;
  valueLabel: string; // short label printed at the bar tip
  valueFull: string; // full value for the tooltip and table
}

interface Props {
  caption: string;
  rows: BarDatum[];
  view: 'chart' | 'table';
}

// Space reserved at the right of the track for the value label at the bar tip.
const LABEL_RESERVE = 96;

/**
 * Ranked horizontal bars. One hue, because the categories are nominal: the
 * bars differ by length, not by color. Each row is the hit target and carries
 * its own tooltip on hover and focus.
 */
export function RankedBars({ caption, rows, view }: Props) {
  if (view === 'table') {
    return (
      <DataTable
        caption={caption}
        head={['Регион', 'Выручка', 'Доля']}
        rows={rows.map((r) => [r.name, r.valueFull, `${Math.round(r.share * 100)}%`])}
      />
    );
  }

  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <ol className="rb" aria-label={caption}>
      {rows.map((r) => {
        const ratio = r.value / max;
        const width = `calc((100% - ${LABEL_RESERVE}px) * ${ratio.toFixed(4)})`;
        return (
          <li key={r.name} className="rb-row" tabIndex={0}>
            <span className="rb-name">{r.name}</span>
            <span className="rb-track">
              <span className="rb-fill" style={{ width }} />
              <span className="rb-value" style={{ left: `calc(${width} + 8px)` }}>
                {r.valueLabel}
              </span>
            </span>
            <span className="tip rb-tip" role="tooltip">
              <span className="tip-title">{r.name}</span>
              <span className="tip-row">
                <strong className="tip-value">{r.valueFull}</strong>
              </span>
              <span className="tip-name">{`${Math.round(r.share * 100)}% от итога`}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
