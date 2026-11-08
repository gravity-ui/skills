import {Text} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpu-data';

export function App() {
  return (
    <main className="monitoring">
      <header className="monitoring-header">
        <Text as="h1" variant="header-2">Мониторинг</Text>
        <Text color="secondary">Демонстрационные метрики · интервал 2 секунды</Text>
      </header>
      <CpuChart source={demoCpuSource} />
    </main>
  );
}
