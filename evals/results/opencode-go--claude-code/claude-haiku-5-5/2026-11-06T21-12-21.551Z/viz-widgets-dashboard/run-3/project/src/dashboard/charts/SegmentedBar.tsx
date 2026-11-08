import { DataTable } from './DataTable';

export interface Part {
  name: string;
  share: number; // 0..1, parts sum to 1
  valueFull: string;
  color: string; // CSS color (a categorical slot)
  labelColor: string; // text on the fill: white, or near-black on the yellow slot
}

interface Props {
  caption: string;
  parts: Part[];
  view: 'chart' | 'table';
}

// Only print the share inside a block when it has room for it.
const MIN_LABEL_SHARE = 0.15;

/**
 * One whole split into parts. The tall form: each block prints its share when
 * it fits, the legend lists names in block order, and hover/focus on a block
 * gives its full value. The table view carries every number.
 */
export function SegmentedBar({ caption, parts, view }: Props) {
  if (view === 'table') {
    return (
      <DataTable
        caption={caption}
        head={['Источник', 'Сессии', 'Доля']}
        rows={parts.map((p) => [p.name, p.valueFull, `${Math.round(p.share * 100)}%`])}
      />
    );
  }

  return (
    <div className="seg-wrap">
      <div className="seg" role="group" aria-label={caption}>
        {parts.map((p) => (
          <div
            key={p.name}
            className="seg-part"
            tabIndex={0}
            style={{ flex: `${p.share} 1 0`, background: p.color, color: p.labelColor }}
          >
            {p.share >= MIN_LABEL_SHARE && (
              <span className="seg-label">{`${Math.round(p.share * 100)}%`}</span>
            )}
            <span className="tip seg-tip" role="tooltip">
              <span className="tip-title">{p.name}</span>
              <span className="tip-row">
                <strong className="tip-value">{p.valueFull}</strong>
              </span>
              <span className="tip-name">{`${Math.round(p.share * 100)}% сессий`}</span>
            </span>
          </div>
        ))}
      </div>
      <ul className="seg-legend">
        {parts.map((p) => (
          <li key={p.name}>
            <span className="legend-key legend-key-box" style={{ background: p.color }} />
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
