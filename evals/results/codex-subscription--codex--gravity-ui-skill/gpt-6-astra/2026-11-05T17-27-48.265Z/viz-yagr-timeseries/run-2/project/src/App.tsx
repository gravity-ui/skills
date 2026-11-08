import {Text} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpu-source';
import './monitoring.css';

export function App() {
  return (
    <main className="monitoring">
      <Text as="h1" variant="header-1">Мониторинг</Text>
      <Text as="p" color="secondary">Демонстрационные метрики · обновление каждую секунду</Text>
      <CpuChart source={demoCpuSource} />
    </main>
  );
}
