import ChartKit, {settings} from '@gravity-ui/chartkit';
import {Loader, SegmentedRadioGroup} from '@gravity-ui/uikit';
import type {ChartKitPlugin, ChartKitType} from '@gravity-ui/chartkit';
import React from 'react';
import type {createMonitoringChartConfig, createSalesChartConfig} from './chart-configs';

export type DashboardVisualizationMode = 'sales' | 'monitoring';

export type DashboardVisualizationWidgetData = {
  sales: ReturnType<typeof createSalesChartConfig>;
  monitoring: ReturnType<typeof createMonitoringChartConfig>;
  initialMode?: DashboardVisualizationMode;
};

export type DashboardVisualizationWidgetProps = {
  data: DashboardVisualizationWidgetData;
  className?: string;
};

let pluginsRegistered = false;
const loadedPluginTypes = new Set<ChartKitType>();

function registerVisualizationPlugins(plugins: ChartKitPlugin[]) {
  settings.set({plugins});
  pluginsRegistered = true;
}

function loadPlugin(mode: DashboardVisualizationMode): Promise<ChartKitType> {
  if (mode === 'sales') {
    return import('@gravity-ui/chartkit/gravity-charts').then(({GravityChartsPlugin}) => {
      if (!loadedPluginTypes.has(GravityChartsPlugin.type)) {
        registerVisualizationPlugins([GravityChartsPlugin]);
        loadedPluginTypes.add(GravityChartsPlugin.type);
      }
      return GravityChartsPlugin.type;
    });
  }

  return import('@gravity-ui/chartkit/yagr').then(({YagrPlugin}) => {
    if (!loadedPluginTypes.has(YagrPlugin.type)) {
      registerVisualizationPlugins([YagrPlugin]);
      loadedPluginTypes.add(YagrPlugin.type);
    }
    return YagrPlugin.type;
  });
}

export function DashboardVisualizationWidget({data, className}: DashboardVisualizationWidgetProps) {
  const [mode, setMode] = React.useState<DashboardVisualizationMode>(data.initialMode ?? 'sales');
  const [engine, setEngine] = React.useState<ChartKitType | null>(null);

  React.useEffect(() => {
    let subscribed = true;
    setEngine(null);
    void loadPlugin(mode).then((pluginType) => {
      if (subscribed) {
        setEngine(pluginType);
      }
    });
    return () => {
      subscribed = false;
    };
  }, [mode]);

  return (
    <section className={className}>
      <SegmentedRadioGroup<DashboardVisualizationMode>
        aria-label="Режим визуализации"
        size="m"
        value={mode}
        onUpdate={setMode}
      >
        <SegmentedRadioGroup.Option content="Продажи" value="sales" />
        <SegmentedRadioGroup.Option content="Мониторинг" value="monitoring" />
      </SegmentedRadioGroup>
      <div style={{height: 420, marginTop: 16}}>
        {engine === null ? (
          <Loader size="m" />
        ) : mode === 'sales' ? (
          <ChartKit
            type="gravity-charts"
            data={data.sales.data}
            renderPluginLoader={() => <Loader size="m" />}
          />
        ) : (
          <ChartKit
            type="yagr"
            data={data.monitoring}
            renderPluginLoader={() => <Loader size="m" />}
          />
        )}
      </div>
    </section>
  );
}
