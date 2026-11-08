import React from 'react';
import {Button, Flex, Icon, Text, configure, Lang} from '@gravity-ui/uikit';
import {
  ArrowRotateLeft,
  Check,
  ChartBar,
  ChartColumn,
  ListUl,
  Pencil,
  TextAlignLeft,
} from '@gravity-ui/icons';
import {ActionPanel, DashKit, DashKitDnDWrapper, pluginTitle} from '@gravity-ui/dashkit';
import type {DashKitProps, ItemDropProps} from '@gravity-ui/dashkit';

import './App.css';
import {
  NEW_WIDGET_DATA,
  WIDGET_TYPES,
  activityPlugin,
  kpiPlugin,
  notePlugin,
  progressPlugin,
} from './widgets';

configure({lang: Lang.En});

DashKit.setSettings({gridLayout: {margin: [12, 12], rowHeight: 24}});
DashKit.registerPlugins(pluginTitle, kpiPlugin, progressPlugin, activityPlugin, notePlugin);

type Config = DashKitProps['config'];
type WidgetType = keyof typeof WIDGET_TYPES;

const STORAGE_KEY = 'dashboard-config-v1';

const DEFAULT_CONFIG: Config = {
  salt: '0.1',
  counter: 7,
  items: [
    {id: 'k1', type: 'kpi', namespace: 'default', data: {label: 'Revenue', value: '$128,400', delta: '12.4%', trend: 'up'}},
    {id: 'k2', type: 'kpi', namespace: 'default', data: {label: 'Active users', value: '8,246', delta: '3.1%', trend: 'up'}},
    {id: 'k3', type: 'kpi', namespace: 'default', data: {label: 'Churn rate', value: '2.4%', delta: '0.6%', trend: 'down'}},
    {id: 'k4', type: 'kpi', namespace: 'default', data: {label: 'Avg. response time', value: '184 ms', delta: '9.0%', trend: 'down'}},
    {
      id: 'p1',
      type: 'progress',
      namespace: 'default',
      data: {
        title: 'Quarter goals',
        items: [
          {name: 'New customers', value: 82, theme: 'success'},
          {name: 'Support SLA', value: 64},
          {name: 'Infrastructure migration', value: 35, theme: 'warning'},
          {name: 'Security audit', value: 18, theme: 'danger'},
        ],
      },
    },
    {
      id: 'a1',
      type: 'activity',
      namespace: 'default',
      data: {
        title: 'Recent activity',
        items: [
          {text: 'Deploy v2.14.0 finished', time: '2m', tag: 'deploy', theme: 'success'},
          {text: 'Alert: CPU above 85% on worker-3', time: '18m', tag: 'alert', theme: 'danger'},
          {text: 'New enterprise account: Northwind', time: '1h', tag: 'sales', theme: 'info'},
          {text: 'Weekly report generated', time: '3h', tag: 'report', theme: 'normal'},
          {text: 'Payment retry scheduled', time: '5h', tag: 'billing', theme: 'warning'},
        ],
      },
    },
    {
      id: 'n1',
      type: 'note',
      namespace: 'default',
      data: {
        title: 'Notes',
        text: 'Click “Edit” to rearrange the dashboard: drag widgets, resize them from the corner, remove them, or add new ones from the panel at the bottom.',
      },
    },
  ],
  layout: [
    {i: 'k1', x: 0, y: 0, w: 9, h: 5},
    {i: 'k2', x: 9, y: 0, w: 9, h: 5},
    {i: 'k3', x: 18, y: 0, w: 9, h: 5},
    {i: 'k4', x: 27, y: 0, w: 9, h: 5},
    {i: 'p1', x: 0, y: 5, w: 14, h: 9},
    {i: 'a1', x: 14, y: 5, w: 22, h: 9},
    {i: 'n1', x: 0, y: 14, w: 14, h: 5},
  ],
  aliases: {},
  connections: [],
};

function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as Config;
    }
  } catch {
    // corrupted storage — fall back to the default dashboard
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config: Config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // storage unavailable — keep working in memory
  }
}

const PALETTE: {type: WidgetType; title: string; icon: React.ReactNode}[] = [
  {type: 'kpi', title: 'Metric', icon: <Icon data={ChartColumn} size={16} />},
  {type: 'progress', title: 'Progress', icon: <Icon data={ChartBar} size={16} />},
  {type: 'activity', title: 'Activity', icon: <Icon data={ListUl} size={16} />},
  {type: 'note', title: 'Note', icon: <Icon data={TextAlignLeft} size={16} />},
];

export function App() {
  const [config, setConfig] = React.useState<Config>(loadConfig);
  const [editMode, setEditMode] = React.useState(false);
  // Snapshot taken when entering edit mode, so "Cancel"-like reset is possible.
  const savedRef = React.useRef<Config>(config);

  const addWidget = React.useCallback((type: WidgetType) => {
    setConfig((prev) =>
      DashKit.setItem({
        item: {type, data: NEW_WIDGET_DATA[type]},
        config: prev,
      }),
    );
  }, []);

  const onChange = React.useCallback<NonNullable<DashKitProps['onChange']>>(({config: next}) => {
    setConfig(next);
  }, []);

  const onDrop = React.useCallback((dropProps: ItemDropProps) => {
    const type = dropProps.dragProps.type as WidgetType;
    setConfig((prev) =>
      DashKit.setItem({
        item: {
          type,
          data: NEW_WIDGET_DATA[type],
          layout: {
            x: dropProps.itemLayout.x,
            y: dropProps.itemLayout.y,
            w: dropProps.itemLayout.w,
            h: dropProps.itemLayout.h,
          },
        },
        config: prev,
        options: {updateLayout: dropProps.newLayout},
      }),
    );
    dropProps.commit();
  }, []);

  const startEdit = () => {
    savedRef.current = config;
    setEditMode(true);
  };

  const save = () => {
    saveConfig(config);
    savedRef.current = config;
    setEditMode(false);
  };

  const cancel = () => {
    setConfig(savedRef.current);
    setEditMode(false);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(DEFAULT_CONFIG);
    savedRef.current = DEFAULT_CONFIG;
  };

  const actionPanelItems = PALETTE.map(({type, title, icon}) => ({
    id: type,
    title,
    icon,
    qa: `add-${type}`,
    onClick: () => addWidget(type),
    dragProps: {type},
  }));

  return (
    <div className="app">
      <Flex alignItems="center" justifyContent="space-between" gap={3} className="app__header">
        <Text variant="header-1" ellipsis style={{flex: 1, minWidth: 0}}>
          Dashboard
        </Text>
        <Flex gap={2} style={{flexShrink: 0}}>
          {editMode ? (
            <React.Fragment>
              <Button view="flat" onClick={reset}>
                <Icon data={ArrowRotateLeft} size={16} />
                Reset
              </Button>
              <Button view="outlined" onClick={cancel}>
                Cancel
              </Button>
              <Button view="action" onClick={save}>
                <Icon data={Check} size={16} />
                Save
              </Button>
            </React.Fragment>
          ) : (
            <Button view="normal" onClick={startEdit}>
              <Icon data={Pencil} size={16} />
              Edit
            </Button>
          )}
        </Flex>
      </Flex>

      <DashKitDnDWrapper>
        <div className="app__grid">
          <DashKit config={config} editMode={editMode} onChange={onChange} onDrop={onDrop} />
          {editMode ? <ActionPanel items={actionPanelItems} /> : null}
        </div>
      </DashKitDnDWrapper>
    </div>
  );
}
