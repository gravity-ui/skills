import {useMemo} from 'react';
import {CpuChart} from './CpuChart';
import {createDemoCpuSource} from './cpuData';
import './styles.css';

export function App() {
  const source = useMemo(() => createDemoCpuSource(), []);
  return (
    <main className="monitoring">
      <header className="page-heading">
        <div className="eyebrow">ОБЗОР СИСТЕМЫ</div>
        <h1>Мониторинг</h1>
        <p>Использование ресурсов за последние сутки</p>
      </header>
      <div className="demo-notice"><span>Демо</span>Демонстрационные метрики · обновление каждые 2 секунды</div>
      <CpuChart source={source} />
    </main>
  );
}
