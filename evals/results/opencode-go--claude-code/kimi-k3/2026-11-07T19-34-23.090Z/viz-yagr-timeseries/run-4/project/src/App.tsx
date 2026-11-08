import {useCallback, useState} from 'react';
import {Card, Icon, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {CpuLoadChart} from './CpuLoadChart';
import {formatPercent, type CpuStats} from './cpuData';
import './app.css';

type ThemeValue = 'light' | 'dark';

function Stat({label, value}: {label: string; value: string}) {
  return (
    <div className="stat">
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="subheader-2" className="stat__value">
        {value}
      </Text>
    </div>
  );
}

function MonitoringPage({theme, onThemeChange}: {theme: ThemeValue; onThemeChange: (t: ThemeValue) => void}) {
  const [stats, setStats] = useState<CpuStats>({current: null, avg: null, max: null});
  const handleStats = useCallback((s: CpuStats) => setStats(s), []);

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__title">
          <Text variant="header-1">Мониторинг</Text>
          <Text variant="body-2" color="secondary">
            prod-cluster · node-01
          </Text>
        </div>
        <label className="theme-toggle">
          <Icon data={Sun} size={16} />
          <Switch
            checked={theme === 'dark'}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
            aria-label="Тёмная тема"
          />
          <Icon data={Moon} size={16} />
        </label>
      </header>

      <Card view="filled" size="l" className="cpu-chart-card">
        <div className="cpu-chart-card__head">
          <div className="page__title">
            <Text variant="subheader-2">Загрузка CPU</Text>
            <Text variant="body-2" color="secondary">
              Последние 24 часа · обновление каждую секунду
            </Text>
          </div>
          <div className="stats">
            <Stat label="Сейчас" value={formatPercent(stats.current)} />
            <Stat label="Среднее" value={formatPercent(stats.avg)} />
            <Stat label="Максимум" value={formatPercent(stats.max)} />
          </div>
        </div>
        <CpuLoadChart theme={theme} onStats={handleStats} />
        <Text variant="caption-2" color="secondary">
          Выделите диапазон мышью, чтобы приблизить. Двойной клик — сбросить масштаб.
        </Text>
      </Card>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<ThemeValue>('light');
  return (
    <ThemeProvider theme={theme}>
      <MonitoringPage theme={theme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}
