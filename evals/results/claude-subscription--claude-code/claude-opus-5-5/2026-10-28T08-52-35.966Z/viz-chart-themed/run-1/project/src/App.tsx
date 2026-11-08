import { useState } from 'react';
import { Card, SegmentedRadioGroup, Table, Text } from '@gravity-ui/uikit';

import { ThemedLineChart } from './ThemedLineChart';
import type { LineSeries } from './ThemedLineChart';

const MONTHS = ['ноя', 'дек', 'янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт'];

const SERIES: LineSeries[] = [
  {
    id: 'desktop',
    name: 'Десктоп',
    values: [18400, 19800, 17200, 18900, 20100, 21300, 20700, 19500, 18800, 19900, 22400, 23800],
  },
  {
    id: 'mobile',
    name: 'Мобильные',
    values: [9200, 10400, 9800, 11300, 12900, 13600, 14800, 15900, 16400, 15700, 16900, 17300],
  },
];

const numberFormat = new Intl.NumberFormat('ru-RU').format;

type View = 'chart' | 'table';

export function App() {
  const [view, setView] = useState<View>('chart');

  const rows = MONTHS.map((month, i) => ({
    month,
    ...Object.fromEntries(SERIES.map((s) => [s.id, numberFormat(s.values[i])])),
  }));

  return (
    <div style={{ padding: 24, maxWidth: 880 }}>
      <Card view="outlined" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Text as="h2" variant="subheader-2" style={{ margin: 0 }}>
              Сеансы по платформам
            </Text>
            <Text as="p" variant="body-1" color="secondary" style={{ margin: '4px 0 16px' }}>
              Ноябрь 2025 — октябрь 2026, в месяц
            </Text>
          </div>
          <SegmentedRadioGroup
            size="m"
            value={view}
            onUpdate={(value) => setView(value as View)}
            options={[
              { value: 'chart', content: 'График' },
              { value: 'table', content: 'Таблица' },
            ]}
          />
        </div>

        {view === 'chart' ? (
          <ThemedLineChart
            categories={MONTHS}
            series={SERIES}
            ariaLabel="Линейный график сеансов по платформам за 12 месяцев"
          />
        ) : (
          <Table
            width="max"
            data={rows}
            columns={[
              { id: 'month', name: 'Месяц' },
              ...SERIES.map((s) => ({ id: s.id, name: s.name, align: 'end' as const })),
            ]}
          />
        )}
      </Card>
    </div>
  );
}
