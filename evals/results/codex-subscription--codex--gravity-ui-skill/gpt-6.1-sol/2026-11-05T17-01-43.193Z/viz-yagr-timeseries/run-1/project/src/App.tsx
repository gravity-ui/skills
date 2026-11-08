import {Button, Text, useThemeValue} from '@gravity-ui/uikit';

import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpuSource';
import './monitoring.css';

export function App({onToggleTheme}: {onToggleTheme: () => void}) {
  const theme = useThemeValue();
  return (
    <main className="monitoring">
      <header className="page-header">
        <div className="page-heading">
          <Text variant="caption-2" color="secondary">ИНФРАСТРУКТУРА / МЕТРИКИ</Text>
          <Text as="h1" variant="header-2">Мониторинг</Text>
          <Text variant="body-2" color="secondary">Состояние процессора за последние 24 часа</Text>
        </div>
        <Button view="outlined" onClick={onToggleTheme}>
          {theme.startsWith('dark') ? 'Светлая тема' : 'Тёмная тема'}
        </Button>
      </header>
      <div className="demo-notice">
        <span className="demo-badge">Демо</span>
        <Text variant="body-1" color="secondary">Синтетические метрики · шаг 2 секунды · обновление в реальном времени</Text>
      </div>
      <CpuChart source={demoCpuSource} />
      <footer className="page-footer">
        <Text variant="caption-2" color="secondary">CPU · загрузка процессора в процентах</Text>
        <Text variant="caption-2" color="secondary">Время на графике указано в UTC</Text>
      </footer>
    </main>
  );
}
