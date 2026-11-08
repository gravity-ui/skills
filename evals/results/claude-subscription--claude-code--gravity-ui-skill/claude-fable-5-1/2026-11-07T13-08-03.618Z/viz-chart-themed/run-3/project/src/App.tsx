import React from 'react';
import { Chart, type ChartData } from '@gravity-ui/charts';
import {
  Card,
  Flex,
  SegmentedRadioGroup,
  Text,
  type Theme,
  useThemeType,
} from '@gravity-ui/uikit';

import { MAU_BY_PLATFORM } from './data';

/**
 * Series colors come from the Gravity UI Charts default palette (DEFAULT_PALETTE),
 * picked in a fixed order so adjacent hues stay distinguishable for color-blind
 * readers. Everything else (text, grid, axes, tooltip, legend) is themed by
 * `@gravity-ui/charts` through the `--g-*` tokens of the active ThemeProvider.
 */
const SERIES_COLORS = ['#4DA2F1', '#FF7E00', '#0FA08D'];

const chartData: ChartData = {
  title: { text: 'Активные пользователи по платформам, 2025' },
  colors: SERIES_COLORS,
  xAxis: {
    type: 'datetime',
    labels: { dateFormat: 'MMM' },
    grid: { enabled: false },
    crosshair: { enabled: true, snap: true },
  },
  yAxis: [
    {
      type: 'linear',
      title: { text: 'тыс. пользователей' },
      grid: { enabled: true },
      lineVisible: false,
      min: 0,
    },
  ],
  series: {
    data: MAU_BY_PLATFORM.map((series) => ({
      type: 'line',
      name: series.name,
      data: series.data,
      lineWidth: 2,
      interpolation: { type: 'monotone' },
      marker: { enabled: false, radius: 4 },
    })),
  },
  legend: { enabled: true, position: 'bottom' },
  tooltip: {
    enabled: true,
    valueFormat: { type: 'number', precision: 0, postfix: ' тыс.' },
  },
};

const THEME_LABELS: Record<Theme, string> = {
  system: 'Системная',
  light: 'Светлая',
  dark: 'Тёмная',
  'light-hc': 'Светлая (контраст)',
  'dark-hc': 'Тёмная (контраст)',
};

interface AppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  // Resolved theme type (light/dark) — `system` is resolved from OS preference.
  const themeType = useThemeType();

  return (
    <Flex direction="column" gap={6} style={{ padding: 'var(--g-spacing-6)', minWidth: 0 }}>
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Flex direction="column" gap={1} style={{ minWidth: 0 }}>
          <Text variant="header-1">Аналитика</Text>
          <Text variant="body-1" color="secondary">
            Тема приложения: {THEME_LABELS[theme]}, применена {themeType === 'dark' ? 'тёмная' : 'светлая'}
          </Text>
        </Flex>
        <SegmentedRadioGroup<Theme>
          size="m"
          value={theme}
          onUpdate={onThemeChange}
          aria-label="Тема приложения"
          options={[
            { value: 'light', content: 'Светлая' },
            { value: 'dark', content: 'Тёмная' },
            { value: 'system', content: 'Системная' },
          ]}
        />
      </Flex>

      <Card view="outlined" type="container" style={{ padding: 'var(--g-spacing-4)' }}>
        {/* Chart fills its parent, so the wrapper needs an explicit height. */}
        <div style={{ height: 400, minWidth: 0 }}>
          <Chart data={chartData} />
        </div>
      </Card>
    </Flex>
  );
}
