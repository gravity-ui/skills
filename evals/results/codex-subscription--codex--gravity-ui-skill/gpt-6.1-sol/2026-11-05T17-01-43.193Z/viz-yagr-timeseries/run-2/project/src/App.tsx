import {useState} from 'react';
import {Button, Text, ThemeProvider, useThemeType} from '@gravity-ui/uikit';

import {CpuLoadChart} from './monitoring/CpuLoadChart';
import {demoCpuSource} from './monitoring/demoCpuSource';
import './monitoring/monitoring.css';

function MonitoringPage({onThemeChange}: {onThemeChange: (theme: 'light' | 'dark') => void}) {
  const theme = useThemeType();

  return (
    <main className="monitoring">
      <header className="monitoring__header">
        <div className="monitoring__heading">
          <Text as="h1" variant="header-2">Мониторинг</Text>
          <Text color="secondary">Состояние процессора за последние 24 часа</Text>
        </div>
        <Button onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </Button>
      </header>

      <CpuLoadChart source={demoCpuSource} />
      <Text as="p" variant="caption-2" color="secondary">
        Демонстрационные данные · измерение каждые 2 секунды.
        Для реальных метрик подключите источник CPU вместо демопотока.
      </Text>
    </main>
  );
}

export function App() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  return (
    <ThemeProvider theme={theme}>
      <MonitoringPage onThemeChange={setTheme} />
    </ThemeProvider>
  );
}
