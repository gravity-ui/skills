import { Button, Icon } from '@gravity-ui/uikit';
import { ChartAreaStacked, LayoutList } from '@gravity-ui/icons';

export type ChartView = 'chart' | 'table';

export function ChartViewToggle({ view, onChange }: { view: ChartView; onChange: (v: ChartView) => void }) {
  const next: ChartView = view === 'chart' ? 'table' : 'chart';
  return (
    <Button
      view="flat-secondary"
      size="s"
      onClick={() => onChange(next)}
      aria-pressed={view === 'table'}
      aria-label={view === 'chart' ? 'Показать таблицей' : 'Показать графиком'}
      title={view === 'chart' ? 'Таблица' : 'График'}
    >
      <Icon data={view === 'chart' ? LayoutList : ChartAreaStacked} size={16} />
    </Button>
  );
}
