import {useState} from 'react';
import {Card, SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';

import {CpuUsageChart} from './monitoring/CpuUsageChart';
import {useCpuFeed, useCpuStats} from './monitoring/useCpuFeed';
import './App.css';

type ThemeMode = 'light' | 'dark';

const percent = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export function App() {
  const [mode, setMode] = useState<ThemeMode>('light');

  return (
    <ThemeProvider theme={mode}>
      <MonitoringPage mode={mode} onModeChange={setMode} />
    </ThemeProvider>
  );
}

interface MonitoringPageProps {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

function MonitoringPage({mode, onModeChange}: MonitoringPageProps) {
  const feed = useCpuFeed();
  const stats = useCpuStats(feed);

  return (
    <div className="monitor">
      <header className="monitor__header">
        <div>
          <Text variant="header-2" as="h1">
            Мониторинг · CPU
          </Text>
          <Text variant="body-1" color="secondary">
            Загрузка CPU за последние 24 часа, обновление каждые 2 с
          </Text>
        </div>
        <SegmentedRadioGroup name="theme" value={mode} onUpdate={onModeChange}>
          <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </header>

      <div className="monitor__stats">
        <Stat label="Сейчас" value={`${percent.format(stats.current)}%`} />
        <Stat label="Среднее за 24 ч" value={`${percent.format(stats.average)}%`} />
        <Stat label="Максимум за 24 ч" value={`${percent.format(stats.max)}%`} />
      </div>

      <Card view="outlined" size="l" className="monitor__panel">
        <CpuUsageChart feed={feed} />
      </Card>
    </div>
  );
}

function Stat({label, value}: {label: string; value: string}) {
  return (
    <div className="monitor__stat">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="subheader-2">{value}</Text>
    </div>
  );
}
