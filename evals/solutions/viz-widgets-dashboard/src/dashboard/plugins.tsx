// Widget plugins for the dashboard grid. DashKit renders items by `type`,
// resolving each type through the plugin registry, so every widget type used
// in the config must be registered before the first <DashKit> render.
import { DashKit, pluginText, pluginTitle } from '@gravity-ui/dashkit';
import type { Plugin, PluginWidgetProps } from '@gravity-ui/dashkit';
import { Text } from '@gravity-ui/uikit';

// Custom widget plugin: a KPI card. `item.data` is the plugin's payload.
type StatWidgetData = {
  label: string;
  value: string;
  trend?: string;
};

function StatWidget({ data }: { data: StatWidgetData }) {
  return (
    <div className="stat-widget">
      <Text variant="body-1" color="secondary">
        {data.label}
      </Text>
      <Text variant="display-1">{data.value}</Text>
      {data.trend ? (
        <Text variant="body-1" color="positive">
          {data.trend}
        </Text>
      ) : null}
    </div>
  );
}

const pluginStat: Plugin = {
  type: 'stat',
  defaultLayout: { w: 12, h: 5 },
  renderer(props: PluginWidgetProps) {
    return <StatWidget data={props.data as unknown as StatWidgetData} />;
  },
};

// Register once at module scope: DashKit keeps a global registry and throws on
// re-registering an already known type, so this module is imported for its
// side effect exactly once (see App.tsx).
DashKit.registerPlugins(pluginTitle, pluginText, pluginStat);
