import { Card, SegmentedRadioGroup, Text, useTheme } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { MONTHS, SERIES, UNIT } from './data';
import { LineChart } from './LineChart';

export interface AppProps {
  /** Если передан, в шапке появляется переключатель темы приложения. */
  onThemeChange?: (theme: Theme) => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: 24,
        background: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
      }}
    >
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <Text as="h1" variant="header-1" style={{ margin: 0 }}>
            Аналитика
          </Text>
          {onThemeChange && (
            <SegmentedRadioGroup<Theme> size="m" value={theme} onUpdate={onThemeChange} aria-label="Тема приложения">
              <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
            </SegmentedRadioGroup>
          )}
        </header>

        <Card type="container" view="outlined" style={{ padding: 20 }}>
          <LineChart
            title="Активные пользователи"
            subtitle={`По платформам за 2026 год, ${UNIT} чел. в месяц`}
            categories={MONTHS}
            series={SERIES}
            unit={UNIT}
          />
        </Card>
      </div>
    </div>
  );
}
