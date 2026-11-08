import {useMemo} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {createDemoCpuSource} from './cpu-data';
import './App.css';

export function App({onThemeChange}: {onThemeChange?: (theme: 'light' | 'dark') => void}) {
  const source = useMemo(createDemoCpuSource, []);
  const theme = useThemeType();
  return (
    <main className="monitoring-page">
      <header className="page-header">
        <div className="page-heading">
          <Text variant="caption-2" color="secondary">ИНФРАСТРУКТУРА / МОНИТОРИНГ</Text>
          <Text as="h1" variant="header-2">Мониторинг ресурсов</Text>
          <Text variant="body-2" color="secondary">Загрузка процессора и история измерений в реальном времени</Text>
        </div>
        {onThemeChange && <Button view="outlined" onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </Button>}
      </header>
      <div className="source-note"><span className="demo-mark" /><Text variant="body-1" color="secondary">Демонстрационные данные · обновление каждые 2 секунды</Text></div>
      <CpuChart source={source} />
    </main>
  );
}
