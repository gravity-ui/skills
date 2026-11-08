import {CpuChart} from './CpuChart';

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          margin: '0 0 16px 0',
          color: 'var(--g-color-text-primary)',
        }}
      >
        Мониторинг CPU
      </h1>
      <p
        style={{
          margin: '0 0 24px 0',
          color: 'var(--g-color-text-secondary)',
          fontSize: 14,
        }}
      >
        Загрузка процессора за последние 24 часа. Данные обновляются каждые 3 секунды.
      </p>
      <CpuChart />
    </div>
  );
}
