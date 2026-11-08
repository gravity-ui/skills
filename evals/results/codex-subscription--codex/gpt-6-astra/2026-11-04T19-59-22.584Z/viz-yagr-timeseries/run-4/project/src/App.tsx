import {useEffect, useState} from 'react';
import {Button, useThemeType} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {createDemoHistory, nextDemoHistory} from './cpuData';

export function App({onThemeChange}: {onThemeChange?: (theme: 'light' | 'dark') => void}) {
  const [data, setData] = useState(createDemoHistory);
  const theme = useThemeType();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setData((previous) => nextDemoHistory(previous, Date.now()));
    }, 2_000);
    return () => window.clearInterval(timer);
  }, []);

  const current = data.values.at(-1);
  return (
    <main className="monitoring">
      <header className="monitoring-header">
        <div>
          <div className="eyebrow">СИСТЕМА / ПРОИЗВОДИТЕЛЬНОСТЬ</div>
          <h1>Мониторинг</h1>
          <p className="muted">Загрузка процессора за последние сутки</p>
        </div>
        {onThemeChange && <Button onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </Button>}
      </header>
      <section className="cpu-panel" aria-labelledby="cpu-heading">
        <div className="panel-heading">
          <div>
            <h2 id="cpu-heading"><span className="series-dot" />Загрузка CPU</h2>
            <p className="muted">Демонстрационные данные · обновление каждые 2 секунды</p>
          </div>
          <div className="current-value">
            <span className="muted">Сейчас</span>
            <strong>{current?.toFixed(1) ?? '—'}<small> %</small></strong>
          </div>
        </div>
        <CpuChart data={data} />
        <footer className="panel-footer">
          <span>{data.timeline.length.toLocaleString('ru-RU')} точек за 24 часа</span>
          <span>Время — локальное · CPU — %</span>
        </footer>
      </section>
      <p className="demo-note muted">Источник метрик пока не подключён. График показывает синтетическую нагрузку.</p>
    </main>
  );
}
