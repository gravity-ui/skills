import * as React from 'react';
import { SegmentedRadioGroup, Table, Text } from '@gravity-ui/uikit';

import { LineChart, type LineSeries } from './LineChart';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const SERIES: LineSeries[] = [
  { id: 'web', name: 'Веб', values: [12400, 13100, 12800, 14200, 15600, 15100, 16300, 17800, 17200, 18900, 19600, 21300] },
  { id: 'mobile', name: 'Мобильное', values: [6200, 6900, 7800, 8100, 9400, 10800, 11200, 11900, 13400, 13800, 14900, 15400] },
];

const numberFormat = new Intl.NumberFormat('ru-RU');

type View = 'chart' | 'table';

export function App() {
  const [view, setView] = React.useState<View>('chart');

  const tableData = MONTHS.map((month, i) => ({
    month,
    ...Object.fromEntries(SERIES.map((s) => [s.id, numberFormat.format(s.values[i])])),
  }));

  return (
    <div style={{ padding: 24, maxWidth: 960, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Text variant="subheader-3" as="h2" style={{ margin: 0 }}>
            Активные пользователи по месяцам
          </Text>
          <Text variant="body-1" color="secondary">
            2026 год, по платформам
          </Text>
        </div>
        <SegmentedRadioGroup<View> value={view} onUpdate={setView}>
          <SegmentedRadioGroup.Option value="chart">График</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="table">Таблица</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </div>

      {view === 'chart' ? (
        <LineChart categories={MONTHS} series={SERIES} />
      ) : (
        <Table
          width="max"
          data={tableData}
          columns={[
            { id: 'month', name: 'Месяц' },
            ...SERIES.map((s) => ({ id: s.id, name: s.name, align: 'end' as const })),
          ]}
        />
      )}
    </div>
  );
}
