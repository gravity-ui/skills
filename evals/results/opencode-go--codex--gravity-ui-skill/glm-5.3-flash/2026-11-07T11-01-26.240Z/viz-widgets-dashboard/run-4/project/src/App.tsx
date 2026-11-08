import React from 'react';
import {
  ActionPanel,
  DashKit,
  DashKitDnDWrapper,
  type Config,
  type ConfigItem,
  type DashKitProps,
  type ItemDropProps,
  type Plugin,
  type PluginWidgetProps,
} from '@gravity-ui/dashkit';
import { configure, Icon, Lang, Button } from '@gravity-ui/uikit';
import { ChartColumn, LayoutCells, Percent } from '@gravity-ui/icons';
import './dashboard/dashboard.css';
import type { WidgetData } from './dashboard/widgets';

configure({ lang: Lang.Ru });

type WidgetType = 'metric' | 'chart' | 'status';

type WidgetProps = PluginWidgetProps & {
  data: WidgetData;
};

type WidgetPlugin = Plugin<WidgetProps>;

function MetricWidget(props: Pick<WidgetProps, 'data'>) {
  const itemData = props.data as { label: string; value: string; trend: string };

  return (
    <div className="dashboard-widget">
      <p className="dashboard-widget__label">{itemData.label}</p>
      <p className="dashboard-widget__metric">{itemData.value}</p>
      <p className="dashboard-widget__trend">{itemData.trend}</p>
    </div>
  );
}

function ChartWidget(props: Pick<WidgetProps, 'data'>) {
  const itemData = props.data as { title: string; points: Array<{ x: string; y: number }> };
  const maxValue = Math.max(...itemData.points.map((point) => point.y));

  return (
    <div className="dashboard-widget">
      <p className="dashboard-widget__label">{itemData.title}</p>
      <div className="dashboard-widget__chart">
        {itemData.points.map((point) => (
          <div
            key={point.x}
            className="dashboard-widget__chart-point"
            style={{ height: `${(point.y / maxValue) * 100}%` }}
          >
            <span>{point.x}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusWidget(props: Pick<WidgetProps, 'data'>) {
  const itemData = props.data as {
    services: Array<{ name: string; state: 'ok' | 'warning' | 'error' }>;
  };

  return (
    <div className="dashboard-widget">
      <p className="dashboard-widget__label">Service health</p>
      <ul className="dashboard-widget__status-list">
        {itemData.services.map((service) => (
          <li key={service.name}>
            <span
              className={`dashboard-widget__status dashboard-widget__status_${service.state}`}
            >
              {service.state}
            </span>
            {service.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

const widgetPlugins: Record<WidgetType, WidgetPlugin> = {
  metric: {
    type: 'metric',
    defaultLayout: { w: 6, h: 4 },
    renderer: ({ data }: WidgetProps) => <MetricWidget data={data} />,
  },
  chart: {
    type: 'chart',
    defaultLayout: { w: 12, h: 7 },
    renderer: ({ data }: Pick<WidgetProps, 'data'>) => <ChartWidget data={data} />,
  },
  status: {
    type: 'status',
    defaultLayout: { w: 12, h: 7 },
    renderer: ({ data }: Pick<WidgetProps, 'data'>) => <StatusWidget data={data} />,
  },
};

DashKit.registerPlugins(...Object.values(widgetPlugins));
DashKit.setSettings({
  gridLayout: {
    cols: 24,
    margin: [12, 12],
    compactType: 'vertical',
  },
});

const firstConfig: Config = {
  salt: 'dashboard-salt',
  counter: 4,
  items: [
    {
      id: 'revenue',
      type: 'metric',
      namespace: 'default',
      data: { label: 'Выручка', value: '4.8M', trend: '+12% к прошлому месяцу' },
    },
    {
      id: 'conversion',
      type: 'metric',
      namespace: 'default',
      data: { label: 'Конверсия', value: '5.3%', trend: '+0.8% к прошлой неделе' },
    },
    {
      id: 'traffic',
      type: 'chart',
      namespace: 'default',
      data: {
        title: 'Активность за неделю',
        points: [
          { x: 'Пн', y: 34 },
          { x: 'Вт', y: 52 },
          { x: 'Ср', y: 61 },
          { x: 'Чт', y: 47 },
          { x: 'Пт', y: 82 },
          { x: 'Сб', y: 70 },
          { x: 'Вс', y: 55 },
        ],
      },
    },
    {
      id: 'services',
      type: 'status',
      namespace: 'default',
      data: {
        services: [
          { name: 'API', state: 'ok' },
          { name: 'Payments', state: 'warning' },
          { name: 'Search', state: 'error' },
        ],
      },
    },
  ],
  layout: [
    { i: 'revenue', x: 0, y: 0, w: 6, h: 4 },
    { i: 'conversion', x: 6, y: 0, w: 6, h: 4 },
    { i: 'traffic', x: 0, y: 4, w: 12, h: 7 },
    { i: 'services', x: 12, y: 4, w: 12, h: 7 },
  ],
  aliases: {},
  connections: [],
};

const panelItems: Array<{
  id: WidgetType;
  type: WidgetType;
  title: string;
  icon: React.ReactNode;
}> = [
  { id: 'metric', type: 'metric', title: 'Метрика', icon: <Icon data={Percent} /> },
  { id: 'chart', type: 'chart', title: 'График', icon: <Icon data={ChartColumn} /> },
  { id: 'status', type: 'status', title: 'Статусы', icon: <Icon data={LayoutCells} /> },
];

function createItemData(type: WidgetType): WidgetData {
  if (type === 'metric') {
    return { label: 'Новая метрика', value: '0', trend: '—' };
  }
  if (type === 'chart') {
    return {
      title: 'Новый график',
      points: [
        { x: 'A', y: 25 },
        { x: 'B', y: 50 },
        { x: 'C', y: 75 },
      ],
    };
  }
  return {
    services: [
      { name: 'Service 1', state: 'ok' },
      { name: 'Service 2', state: 'warning' },
    ],
  };
}

export function App() {
  const [config, setConfig] = React.useState<Config>(firstConfig);
  const [editMode, setEditMode] = React.useState(false);

  const onChange: DashKitProps['onChange'] = ({ config: nextConfig }) => {
    setConfig(nextConfig);
  };

  const onDrop: DashKitProps['onDrop'] = (dropProps: ItemDropProps) => {
    const type = panelItems.find((item) => item.type === dropProps.dragProps.type)?.type;

    if (!type) {
      return;
    }

    const nextConfig = DashKit.setItem({
      item: {
        type,
        namespace: 'default',
        data: createItemData(type) as ConfigItem['data'],
        layout: {
          w: dropProps.itemLayout.w,
          h: dropProps.itemLayout.h,
          x: dropProps.itemLayout.x,
          y: dropProps.itemLayout.y,
        },
      },
      config,
      options: { updateLayout: dropProps.newLayout },
    });

    setConfig(nextConfig);
    dropProps.commit();
  };

  return (
    <div className="dashboard">
      <header className="dashboard__toolbar">
        <h1 className="dashboard__title">Дашборд</h1>
        <div className="dashboard__actions">
          <span className="dashboard__hint">
            {editMode ? 'Перетащите виджет на сетку.' : 'Включите редактирование, чтобы менять раскладку.'}
          </span>
          <Button
            view={editMode ? 'outlined' : 'action'}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Готово' : 'Редактировать'}
          </Button>
        </div>
      </header>
      <main className="dashboard__layout">
        <DashKitDnDWrapper>
          <>
            <div className="dashboard__grid">
              <DashKit
                config={config}
                editMode={editMode}
                onChange={onChange}
                onDrop={onDrop}
              />
            </div>
            <ActionPanel
              disable={!editMode}
              items={panelItems.map((item) => ({
                id: item.id,
                title: item.title,
                icon: item.icon,
                dragProps: { type: item.type },
              }))}
            />
          </>
        </DashKitDnDWrapper>
      </main>
    </div>
  );
}
