import {useState} from 'react';
import {useMeasure} from '../dashboard/useMeasure';

export interface SegmentPart {
  name: string;
  /** 0..1 */
  share: number;
  value: number;
  /** CSS color of the block, e.g. var(--s1) */
  color: string;
  /** legible text color inside the block, e.g. var(--on-s1) */
  onColor: string;
}

interface SegmentedBarProps {
  parts: SegmentPart[];
  formatValue: (v: number) => string;
  ariaLabel: string;
}

/**
 * Tall segmented bar (28px): one whole split into parts.
 * Legend names the parts in block order and repeats no numbers;
 * hover/focus gives name + amount + share; narrow blocks print no label.
 */
export function SegmentedBar({parts, formatValue, ariaLabel}: SegmentedBarProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [barRef, barSize] = useMeasure<HTMLDivElement>();

  return (
    <div className="sb">
      <div className="sb-bar" role="img" aria-label={ariaLabel} ref={barRef}>
        {parts.map((p, i) => {
          // a label is printed only when it fits with comfortable padding
          const partPx = p.share * barSize.width;
          const label = `${Math.round(p.share * 100)}%`;
          const fits = partPx > label.length * 7.2 + 20;
          return (
            <div
              key={p.name}
              className="sb-part"
              style={{width: `${p.share * 100}%`, background: p.color}}
              tabIndex={0}
              aria-label={`${p.name}: ${formatValue(p.value)}, ${Math.round(p.share * 100)} %`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((h) => (h === i ? null : h))}
            >
              {fits && (
                <span className="sb-share" style={{color: p.onColor}}>
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="sb-legend">
        {parts.map((p) => (
          <span className="sb-legend-item" key={p.name}>
            <span className="sb-legend-key" style={{background: p.color}} />
            {p.name}
          </span>
        ))}
      </div>
      {hover !== null && parts[hover] && (
        <div className="sb-readout" role="status">
          <span className="sb-readout-name">
            <span className="sb-legend-key" style={{background: parts[hover].color}} />
            {parts[hover].name}
          </span>
          <span className="sb-readout-value">{formatValue(parts[hover].value)}</span>
          <span className="sb-readout-share">{Math.round(parts[hover].share * 100)} %</span>
        </div>
      )}
      {hover === null && <div className="sb-readout sb-readout-hint">Наведите на сегмент</div>}
    </div>
  );
}
