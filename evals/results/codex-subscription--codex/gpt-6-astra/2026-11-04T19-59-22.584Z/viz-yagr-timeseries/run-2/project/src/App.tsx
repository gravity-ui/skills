import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpuData';
import './monitoring.css';

export function App() {
  return (
    <main className="monitoring">
      <header className="monitoring-header">
        <div>
          <p className="eyebrow">СИСТЕМА / МЕТРИКИ</p>
          <h1>Мониторинг</h1>
          <p className="muted">Производительность процессора за последние сутки</p>
        </div>
        <span className="demo-badge">Демонстрационные данные</span>
      </header>
      <CpuChart source={demoCpuSource} />
      <p className="monitoring-note">
        Демонстрационный поток · Измерение каждые 2 секунды
      </p>
    </main>
  );
}
