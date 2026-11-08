import * as React from 'react';

import {SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';

import {ThemedLineChart, type LineChartDatum} from './ThemedLineChart';

import './App.css';

const ACTIVE_USERS: LineChartDatum[] = [
  {x: 'Янв', y: 12.4},
  {x: 'Фев', y: 14.1},
  {x: 'Мар', y: 13.2},
  {x: 'Апр', y: 16.8},
  {x: 'Май', y: 18.9},
  {x: 'Июн', y: 17.5},
  {x: 'Июл', y: 21.3},
  {x: 'Авг', y: 23.7},
  {x: 'Сен', y: 22.1},
  {x: 'Окт', y: 25.4},
  {x: 'Ноя', y: 27.9},
  {x: 'Дек', y: 30.2},
];

type DemoTheme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = React.useState<DemoTheme>('light');

  return (
    // Nested provider is auto-scoped: it repaints only this subtree, so the
    // chart can be checked against both themes without touching main.tsx.
    <ThemeProvider theme={theme}>
      <main className="page">
        <header className="page__header">
          <div className="page__heading">
            <Text variant="header-1">Дашборд продукта</Text>
            <Text variant="body-2" color="secondary">
              График использует тематические токены Gravity UI и подстраивается под текущую тему.
            </Text>
          </div>
          <SegmentedRadioGroup<DemoTheme>
            value={theme}
            onUpdate={setTheme}
            options={[
              {value: 'light', content: 'Светлая'},
              {value: 'dark', content: 'Тёмная'},
            ]}
          />
        </header>

        <section className="chart-panel">
          <Text variant="subheader-2">Активные пользователи по месяцам</Text>
          <ThemedLineChart data={ACTIVE_USERS} title="Активные пользователи" unit="тыс." />
        </section>
      </main>
    </ThemeProvider>
  );
}
