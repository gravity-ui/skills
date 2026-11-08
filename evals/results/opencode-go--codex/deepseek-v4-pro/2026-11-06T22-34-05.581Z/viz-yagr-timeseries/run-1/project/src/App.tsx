import {Card, Text} from '@gravity-ui/uikit';

import {CpuMonitor} from './CpuMonitor';

export function App() {
  return (
    <div
      style={{
        padding: 24,
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Text variant="header-1">Мониторинг</Text>
      <Card
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          minHeight: 0,
        }}
      >
        <Text variant="subheader-2" style={{marginBottom: 12}}>
          Загрузка CPU за последние сутки
        </Text>
        <div style={{flex: '1 1 auto', minHeight: 0}}>
          <CpuMonitor />
        </div>
      </Card>
    </div>
  );
}
