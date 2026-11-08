import { useMemo, useState } from 'react';
import { Button, Select, Text } from '@gravity-ui/uikit';
import { Dashboard } from './dashboard/Dashboard';
import { WIDGETS } from './dashboard/widgets';
import { buildPeriod } from './dashboard/data';
import { clearLayout } from './dashboard/layoutStorage';
import './dashboard/dashboard.css';

const PERIODS = [7, 30, 90];

export function App() {
  const [days, setDays] = useState(30);
  /** Bumping this remounts the dashboard, so it reloads the default layout. */
  const [layoutKey, setLayoutKey] = useState(0);
  const data = useMemo(() => buildPeriod(days), [days]);

  return (
    <div className="viz-root dashboard-page">
      <header className="dashboard-header">
        <Text as="h1" variant="header-2">
          Сводка продаж
        </Text>
        <Text variant="body-1" color="secondary">
          Перетаскивайте виджеты за заголовок, меняйте размер за правый нижний угол. Раскладка сохраняется в браузере.
        </Text>
      </header>

      <div className="filter-row">
        <Select
          aria-label="Период"
          value={[String(days)]}
          onUpdate={(v) => setDays(Number(v[0]))}
          options={PERIODS.map((p) => ({ value: String(p), content: `${p} дней` }))}
          width="auto"
        />
        <Button
          view="outlined"
          onClick={() => {
            clearLayout();
            setLayoutKey((k) => k + 1);
          }}
        >
          Сбросить раскладку
        </Button>
      </div>

      <Dashboard key={layoutKey} widgets={WIDGETS} data={data} />
    </div>
  );
}
