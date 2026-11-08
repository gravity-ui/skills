import type { Dataset } from '../data';
import { fmtPct, fmtRub } from '../format';
import { Frame } from './Frame';

/** A single ratio against a limit → meter, not a 2-slice pie. */
export function PlanMeter({ data }: { data: Dataset }) {
  const { done, target } = data.plan;
  const ratio = Math.min(done / target, 1);
  return (
    <Frame title="План по выручке" subtitle="За выбранный период">
      <div className="stat__value">{fmtPct(ratio * 100, 0)}</div>
      <div
        className="meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-label="Выполнение плана по выручке"
      >
        <div className="meter__fill" style={{ width: `${ratio * 100}%` }} />
      </div>
      <div className="meter__caption">
        {fmtRub(done)} из {fmtRub(target)}
      </div>
    </Frame>
  );
}
