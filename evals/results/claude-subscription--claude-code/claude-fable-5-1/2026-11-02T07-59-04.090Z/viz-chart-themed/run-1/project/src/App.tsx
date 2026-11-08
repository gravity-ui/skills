import * as React from 'react';
import { Card, SegmentedRadioGroup, Table, Text, ThemeProvider, useTheme } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { CATEGORIES, CHART_SUBTITLE, CHART_TITLE, SERIES, formatNumber } from './data';
import { LineChart } from './LineChart';
import './App.css';

type View = 'chart' | 'table';

type Row = { month: string } & Record<string, string | number>;

const tableData: Row[] = CATEGORIES.map((month, i) => {
  const row: Row = { month };
  for (const s of SERIES) row[s.id] = s.values[i];
  return row;
});

const tableColumns = [
  { id: 'month', name: 'Месяц', primary: true },
  ...SERIES.map((s) => ({
    id: s.id,
    name: s.name,
    align: 'end' as const,
    template: (row: Row) => formatNumber(Number(row[s.id])),
  })),
];

export function App() {
  // Стартуем с темы, заданной в main.tsx, и даём переключить её на странице.
  const initialTheme = useTheme();
  const [theme, setTheme] = React.useState<Theme>(initialTheme);
  const [view, setView] = React.useState<View>('chart');

  return (
    <ThemeProvider theme={theme} rootClassName="app">
      <div className="app__page">
        <header className="app__toolbar">
          <SegmentedRadioGroup<Theme> value={theme} onUpdate={setTheme} size="m" aria-label="Тема приложения">
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
          <SegmentedRadioGroup<View> value={view} onUpdate={setView} size="m" aria-label="Вид данных">
            <SegmentedRadioGroup.Option value="chart">График</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="table">Таблица</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
        </header>

        <Card view="outlined" className="app__card">
          <div className="app__card-header">
            <Text as="h2" variant="subheader-2" className="app__title">
              {CHART_TITLE}
            </Text>
            <Text as="p" variant="body-1" color="secondary" className="app__subtitle">
              {CHART_SUBTITLE}
            </Text>
          </div>

          {view === 'chart' ? (
            <LineChart categories={CATEGORIES} series={SERIES} formatValue={formatNumber} ariaLabel={CHART_TITLE} />
          ) : (
            <Table<Row> data={tableData} columns={tableColumns} getRowId={(row) => row.month} />
          )}
        </Card>
      </div>
    </ThemeProvider>
  );
}
