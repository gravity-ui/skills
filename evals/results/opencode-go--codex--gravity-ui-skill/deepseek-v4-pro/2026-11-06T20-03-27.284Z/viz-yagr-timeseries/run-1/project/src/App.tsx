import {CpuLoadChart} from './components/CpuLoadChart';
import './components/CpuLoadChart.css';

export function App() {
  return (
    <main className="monitoring-page">
      <CpuLoadChart />
    </main>
  );
}
