import {Button, useThemeType} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpu-data';
import './styles.css';

export function App({onThemeChange}: {onThemeChange?: (theme: 'light' | 'dark') => void}) {
  const theme = useThemeType();
  return (
    <main className="monitoring">
      <header className="page-header">
        <div><div className="eyebrow">ОБЗОР СИСТЕМЫ</div><h1>Мониторинг</h1><p>Состояние ресурсов в реальном времени</p></div>
        {onThemeChange && <Button view="outlined" onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</Button>}
      </header>
      <div className="source-bar"><span><i className="live-dot" />Демонстрационный поток</span><span>Обновление каждые 2 секунды</span></div>
      <CpuChart source={demoCpuSource} />
      <p className="demo-note">Показаны демонстрационные данные. Для реальных метрик подключите источник CPU вашей системы.</p>
    </main>
  );
}
