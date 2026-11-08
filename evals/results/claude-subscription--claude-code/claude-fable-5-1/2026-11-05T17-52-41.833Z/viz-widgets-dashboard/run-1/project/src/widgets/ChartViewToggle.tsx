import { SegmentedRadioGroup } from '@gravity-ui/uikit';

export type ChartView = 'chart' | 'table';

export function ChartViewToggle({ value, onChange }: { value: ChartView; onChange: (v: ChartView) => void }) {
  return (
    <div className="viz__toolbar">
      <SegmentedRadioGroup size="s" value={value} onUpdate={(v) => onChange(v as ChartView)} aria-label="Вид">
        <SegmentedRadioGroup.Option value="chart">График</SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="table">Таблица</SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
    </div>
  );
}
