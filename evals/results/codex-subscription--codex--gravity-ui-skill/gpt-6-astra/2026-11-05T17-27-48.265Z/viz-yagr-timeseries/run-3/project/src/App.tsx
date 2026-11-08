import {Text} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {demoCpuSource} from './cpu-data';
import './styles.css';

export function App() {
  return (
    <main className="monitoring-page">
      <header className="page-heading">
        <Text as="div" variant="caption-2" color="secondary">РЕСУРСЫ СИСТЕМЫ</Text>
        <Text as="h1" variant="header-2">Мониторинг</Text>
        <Text color="secondary">Использование процессора и история нагрузки за сутки.</Text>
      </header>
      <div className="demo-note">
        <Text variant="body-1">Демонстрационные данные · источник метрик ещё не подключён</Text>
      </div>
      <CpuChart source={demoCpuSource} />
    </main>
  );
}
