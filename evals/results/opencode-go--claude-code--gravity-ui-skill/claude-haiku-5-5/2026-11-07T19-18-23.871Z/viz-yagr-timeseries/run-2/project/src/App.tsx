import {Text} from '@gravity-ui/uikit';

import './App.css';
import {CpuChart} from './monitoring/CpuChart';
import {useCpuSource} from './monitoring/useCpuSource';

export function App() {
  const cpuSource = useCpuSource();

  return (
    <div className="monitoring-page">
      <div>
        <Text variant="header-1" as="h1">Мониторинг</Text>
        <div>
          <Text variant="body-2" color="secondary">Загрузка CPU за последние сутки, %</Text>
        </div>
      </div>
      <div className="monitoring-page__chart">
        <div className="monitoring-page__plot">
          {cpuSource && <CpuChart source={cpuSource} />}
        </div>
      </div>
    </div>
  );
}
