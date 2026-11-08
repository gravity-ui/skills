import { fmt } from '../format';

interface Props {
  actual: number;
  target: number;
  caption: string;
}

/** Progress toward a target: fill on a lighter step of the same ramp. */
export function Meter({ actual, target, caption }: Props) {
  const ratio = target ? actual / target : 0;
  const pct = Math.round(ratio * 100);
  return (
    <div className="meter">
      <div className="meter__head">
        <span className="meter__value">{pct} %</span>
        <span className="meter__caption">{caption}</span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={actual}
        aria-valuetext={`${pct} % — ${fmt.rubFull(actual)} из ${fmt.rubFull(target)}`}
      >
        <div className="meter__fill" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
      </div>
      <div className="meter__foot">
        <span>{fmt.rub(actual)}</span>
        <span>цель {fmt.rub(target)}</span>
      </div>
    </div>
  );
}
