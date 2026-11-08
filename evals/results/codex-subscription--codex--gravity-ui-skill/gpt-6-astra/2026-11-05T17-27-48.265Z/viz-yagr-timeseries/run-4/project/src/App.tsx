import {useState} from 'react';
import {Switch, Text, ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpu-data';
import './styles.css';

function Monitoring({onThemeChange}: {onThemeChange: (dark: boolean) => void}) {
  const theme = useThemeType();
  return <main className="monitoring">
    <header className="page-header">
      <div>
        <Text as="div" className="eyebrow" color="secondary" variant="caption-2">ОБЗОР СИСТЕМЫ</Text>
        <Text as="h1" variant="header-2">Мониторинг</Text>
        <Text color="secondary" variant="body-2">Производительность системы в реальном времени</Text>
      </div>
      <Switch checked={theme === 'dark'} onUpdate={onThemeChange}>Тёмная тема</Switch>
    </header>
    <div className="demo-notice"><span className="demo-label">Демо</span>
      <Text color="secondary" variant="body-1">Демонстрационные метрики · Новое измерение каждые 2 секунды</Text>
    </div>
    <CpuChart source={demoCpuSource} />
    <footer className="page-footer"><Text color="secondary" variant="caption-2">CPU · История за 24 часа · Загрузка в процентах</Text></footer>
  </main>;
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  return <ThemeProvider theme={theme}>
    <Monitoring onThemeChange={dark => setTheme(dark ? 'dark' : 'light')} />
  </ThemeProvider>;
}
