import {useEffect, useState} from 'react';
import {Card, SegmentedRadioGroup, Text, ThemeProvider, useThemeType} from '@gravity-ui/uikit';

import {CpuChart} from './CpuChart';
import type {ChartTheme} from './CpuChart';
import {createCpuFeed} from './cpuFeed';
import type {CpuFeed, CpuSample} from './cpuFeed';

const CHART_THEME_OPTIONS: {value: ChartTheme; label: string}[] = [
  {value: 'light', label: 'Светлая'},
  {value: 'dark', label: 'Тёмная'},
];

/** График берёт тему из контекста uikit, поэтому совпадает с текущей темой страницы. */
function ThemedCpuChart({feed}: {feed: CpuFeed}) {
  const theme = useThemeType();
  return <CpuChart feed={feed} theme={theme} />;
}

function Monitoring({
  feed,
  theme,
  onThemeChange,
}: {
  feed: CpuFeed;
  theme: ChartTheme;
  onThemeChange: (theme: ChartTheme) => void;
}) {
  const [latest, setLatest] = useState<CpuSample>(() => feed.getLast());

  useEffect(() => feed.subscribe(setLatest), [feed]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100vh',
        boxSizing: 'border-box',
        padding: 24,
        background: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Text as="h1" variant="header-2">
            Мониторинг
          </Text>
          <Text as="p" variant="body-1" color="secondary">
            Загрузка CPU за последние 24 часа · новые точки каждые 2 с
          </Text>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <Text variant="subheader-2">Сейчас: {latest.v.toFixed(1)}%</Text>
          <SegmentedRadioGroup
            size="m"
            value={theme}
            onUpdate={(value) => onThemeChange(value as ChartTheme)}
            aria-label="Тема графика"
          >
            {CHART_THEME_OPTIONS.map((option) => (
              <SegmentedRadioGroup.Option key={option.value} value={option.value}>
                {option.label}
              </SegmentedRadioGroup.Option>
            ))}
          </SegmentedRadioGroup>
        </div>
      </header>

      <Card view="outlined" style={{flex: 1, minHeight: 0, padding: 16, boxSizing: 'border-box'}}>
        <ThemedCpuChart feed={feed} />
      </Card>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<ChartTheme>('light');
  // Фид создаётся один раз на жизнь страницы; таймер запускается только при подписке графика.
  const [feed] = useState(() => createCpuFeed());

  return (
    <ThemeProvider theme={theme}>
      <Monitoring feed={feed} theme={theme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}
