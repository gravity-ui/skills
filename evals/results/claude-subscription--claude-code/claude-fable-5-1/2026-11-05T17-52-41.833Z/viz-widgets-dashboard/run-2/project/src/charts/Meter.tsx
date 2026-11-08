export type MeterSeverity = 'ok' | 'warning' | 'critical';

export function meterSeverity(ratio: number): MeterSeverity {
  if (ratio >= 0.95) return 'critical';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}

/** Заполнение несёт серьёзность; дорожка — светлый шаг той же рампы. */
export function Meter({ ratio, label }: { ratio: number; label: string }) {
  const severity = meterSeverity(ratio);
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <div
      className={`viz-meter viz-meter_${severity}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      aria-label={label}
    >
      <div className="viz-meter__fill" style={{ width: `${clamped * 100}%` }} />
    </div>
  );
}
