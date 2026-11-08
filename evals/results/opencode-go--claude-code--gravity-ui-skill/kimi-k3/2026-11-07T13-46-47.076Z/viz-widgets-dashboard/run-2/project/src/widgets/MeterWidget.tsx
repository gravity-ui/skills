import {Text} from '@gravity-ui/uikit';

export interface MeterWidgetData {
  label: string;
  /** 0–100 */
  value: number;
  caption?: string;
}

export function MeterWidget({data}: {data: MeterWidgetData}) {
  const value = Math.max(0, Math.min(100, data.value));
  return (
    <div className="widget meter">
      <div className="meter__header">
        <Text variant="body-2" color="secondary" ellipsis title={data.label}>
          {data.label}
        </Text>
        <Text variant="subheader-2">{`${value} %`}</Text>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={data.label}
      >
        <div className="meter__fill" style={{width: `${value}%`}} />
      </div>
      {data.caption ? (
        <Text variant="caption-1" color="hint">
          {data.caption}
        </Text>
      ) : null}
    </div>
  );
}
