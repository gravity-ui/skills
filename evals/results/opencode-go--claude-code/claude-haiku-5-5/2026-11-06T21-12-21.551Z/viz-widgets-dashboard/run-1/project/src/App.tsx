import { useEffect, useMemo, useState } from 'react';
import { Button, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { Dashboard } from './dashboard/Dashboard';
import { buildDashboardData, PERIODS, type PeriodId } from './dashboard/data';
import { DEFAULT_LAYOUT } from './dashboard/widgets';
import { loadLayout, saveLayout, type Layout } from './dashboard/grid';
import './dashboard/dashboard.css';

const LAYOUT_STORAGE_KEY = 'dashboard-layout:v1';

export function App() {
  const [periodId, setPeriodId] = useState<PeriodId>('30d');
  const [layout, setLayout] = useState<Layout>(() => loadLayout(LAYOUT_STORAGE_KEY, DEFAULT_LAYOUT));

  useEffect(() => {
    saveLayout(LAYOUT_STORAGE_KEY, layout);
  }, [layout]);

  const period = PERIODS.find((p) => p.id === periodId) ?? PERIODS[1];
  const data = useMemo(() => buildDashboardData(period.days), [period.days]);

  return (
    <div className="dash-page">
      <header className="dash-toolbar">
        <div className="dash-title">
          <h1>Сводка по продажам</h1>
          <p id="dash-keys-hint" className="dash-hint">
            Перетаскивайте карточку за заголовок, тяните правый нижний угол, чтобы изменить размер.
            С клавиатуры: стрелки двигают карточку, Shift + стрелки меняют размер.
          </p>
        </div>
        <div className="dash-controls">
          <SegmentedRadioGroup
            size="m"
            value={periodId}
            onUpdate={(value) => setPeriodId(value as PeriodId)}
            aria-label="Период"
          >
            {PERIODS.map((p) => (
              <SegmentedRadioGroup.Option key={p.id} value={p.id}>
                {p.label}
              </SegmentedRadioGroup.Option>
            ))}
          </SegmentedRadioGroup>
          <Button view="outlined" size="m" onClick={() => setLayout(DEFAULT_LAYOUT)}>
            Сбросить раскладку
          </Button>
        </div>
      </header>

      <Dashboard data={data} layout={layout} onLayoutChange={setLayout} />
    </div>
  );
}
