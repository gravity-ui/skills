import './chart-theme.css';

import React from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {
  Card,
  Flex,
  SegmentedRadioGroup,
  Text,
  ThemeProvider,
  useThemeValue,
  type Theme,
} from '@gravity-ui/uikit';

export interface AppProps {
  /** Theme currently passed to the root ThemeProvider. */
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

/** Monthly revenue by sales channel, thousands of rubles. */
const REVENUE_SERIES = [
  {name: 'Сайт', values: [120, 132, 128, 150, 164, 171, 168, 182, 195, 210, 224, 240]},
  {name: 'Мобильное приложение', values: [60, 68, 75, 82, 95, 104, 118, 126, 140, 152, 170, 185]},
  {name: 'Партнёры', values: [40, 38, 45, 44, 50, 52, 49, 55, 58, 61, 60, 66]},
];

/** CSS custom properties (see chart-theme.css) that hold the per-theme series colors. */
const SERIES_COLOR_VARS = ['--app-chart-series-1', '--app-chart-series-2', '--app-chart-series-3'];

/**
 * Resolves the series palette from CSS tokens on the chart container, so the chart
 * receives concrete color strings that follow the active light/dark theme.
 */
function useThemedSeriesColors(themeValue: string) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [colors, setColors] = React.useState<string[]>([]);

  React.useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }
    const style = getComputedStyle(node);
    setColors(SERIES_COLOR_VARS.map((name) => style.getPropertyValue(name).trim()).filter(Boolean));
  }, [themeValue]);

  return {containerRef, colors};
}

const THEME_OPTIONS: {value: Theme; content: string}[] = [
  {value: 'light', content: 'Светлая'},
  {value: 'dark', content: 'Тёмная'},
  {value: 'system', content: 'Системная'},
];

export function App({theme, onThemeChange}: AppProps) {
  // Resolved theme ('light' | 'dark' | ...-hc) even when `theme` is 'system'.
  const themeValue = useThemeValue();
  const {containerRef, colors} = useThemedSeriesColors(themeValue);

  const chartData = React.useMemo<ChartData>(
    () => ({
      colors: colors.length ? colors : undefined,
      series: {
        data: REVENUE_SERIES.map((series) => ({
          type: 'line',
          name: series.name,
          data: series.values.map((y, index) => ({x: index, y})),
        })),
        options: {
          line: {lineWidth: 2},
        },
      },
      xAxis: {
        type: 'category',
        categories: MONTHS,
      },
      yAxis: [
        {
          type: 'linear',
          title: {text: 'Выручка, тыс. ₽'},
          min: 0,
        },
      ],
      legend: {enabled: true, position: 'bottom'},
      tooltip: {enabled: true},
    }),
    [colors],
  );

  return (
    <Flex direction="column" gap={6} style={{padding: 24, minWidth: 0}}>
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Flex direction="column" gap={1}>
          <Text variant="header-1">Выручка по каналам продаж</Text>
          <Text variant="body-1" color="secondary">
            Помесячно за год, тыс. ₽. Текущая тема: {themeValue}
          </Text>
        </Flex>
        <SegmentedRadioGroup<Theme> value={theme} onUpdate={onThemeChange} size="m">
          {THEME_OPTIONS.map((option) => (
            <SegmentedRadioGroup.Option key={option.value} value={option.value}>
              {option.content}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </Flex>

      <Card view="outlined" style={{padding: 16, minWidth: 0}}>
        {/* A scoped provider renders its own `g-root g-root_theme_*` wrapper, so --g-* and
            --app-chart-* tokens resolve on this subtree in sync with the React theme value
            (no dependency on when <body> gets re-classed). */}
        <ThemeProvider scoped theme={themeValue} rootClassName="app-chart">
          <div ref={containerRef} style={{height: 360, minWidth: 0}}>
            {/* Chart re-mounts on theme change so SVG colors and tokens are re-read consistently. */}
            <Chart key={themeValue} data={chartData} />
          </div>
        </ThemeProvider>
      </Card>
    </Flex>
  );
}
