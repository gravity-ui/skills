import { Button } from '@gravity-ui/uikit';

export type ViewMode = 'chart' | 'table';

/** Every chart has a table twin, so the values stay reachable without hovering. */
export function ViewSwitch({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <Button
      size="s"
      view="flat"
      onClick={() => onChange(view === 'chart' ? 'table' : 'chart')}
    >
      {view === 'chart' ? 'Таблица' : 'График'}
    </Button>
  );
}
