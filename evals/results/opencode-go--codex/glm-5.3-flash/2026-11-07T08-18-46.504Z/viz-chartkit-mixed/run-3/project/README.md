# Visualization widget

`VisualizationWidget` предоставляет один API для двух режимов:

```tsx
<VisualizationWidget
  title="Продажи и мониторинг"
  initialMode="sales"
  height={320}
  data={{
    sales: salesVisualizationData,
    monitoring: monitoringVisualizationData,
  }}
/>
```

- `mode` — необязательный контролируемый пропс (`'sales' | 'monitoring'`); без него переключатель работает локально.
- Движки `SalesChartEngine` и `MonitoringChartEngine` загружаются через `React.lazy`.
- Если данные не переданы, используются встроенные демонстрационные наборы.
