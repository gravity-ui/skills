import {Card, Flex, Label, Progress, Text} from '@gravity-ui/uikit';
import type {LabelProps, ProgressProps} from '@gravity-ui/uikit';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

import './widgets.css';

type Theme = NonNullable<LabelProps['theme']>;

export const WIDGET_TYPES = {
  kpi: 'kpi',
  progress: 'progress',
  activity: 'activity',
  note: 'note',
} as const;

/* ---------- shared frame ---------- */

function WidgetCard({title, children}: {title?: string; children: React.ReactNode}) {
  return (
    <Card type="container" view="outlined" className="widget">
      {title ? (
        <Text variant="subheader-2" ellipsis className="widget__title">
          {title}
        </Text>
      ) : null}
      <div className="widget__body">{children}</div>
    </Card>
  );
}

/* ---------- KPI ---------- */

interface KpiData {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

function KpiWidget({data}: PluginWidgetProps) {
  const {label, value, delta, trend} = data as unknown as KpiData;
  return (
    <WidgetCard>
      <Flex direction="column" justifyContent="center" gap={1} className="widget__fill">
        <Text variant="body-2" color="secondary" ellipsis>
          {label}
        </Text>
        <Text variant="display-2">{value}</Text>
        <div>
          <Label theme={trend === 'up' ? 'success' : 'danger'} size="s">
            {trend === 'up' ? '▲' : '▼'} {delta}
          </Label>
        </div>
      </Flex>
    </WidgetCard>
  );
}

/* ---------- Progress ---------- */

interface ProgressData {
  title: string;
  items: {name: string; value: number; theme?: ProgressProps['theme']}[];
}

function ProgressWidget({data}: PluginWidgetProps) {
  const {title, items} = data as unknown as ProgressData;
  return (
    <WidgetCard title={title}>
      <Flex direction="column" gap={3}>
        {items.map((item) => (
          <Flex key={item.name} direction="column" gap={1}>
            <Flex justifyContent="space-between" gap={2}>
              <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
                {item.name}
              </Text>
              <Text variant="body-1" color="secondary" style={{flexShrink: 0}}>
                {item.value}%
              </Text>
            </Flex>
            <Progress value={item.value} theme={item.theme ?? 'default'} size="xs" />
          </Flex>
        ))}
      </Flex>
    </WidgetCard>
  );
}

/* ---------- Activity ---------- */

interface ActivityData {
  title: string;
  items: {text: string; time: string; tag: string; theme: Theme}[];
}

function ActivityWidget({data}: PluginWidgetProps) {
  const {title, items} = data as unknown as ActivityData;
  return (
    <WidgetCard title={title}>
      <Flex direction="column" gap={2} className="widget__scroll">
        {items.map((item) => (
          <Flex key={item.text} alignItems="center" gap={2}>
            <Label theme={item.theme} size="xs" className="widget__tag">
              {item.tag}
            </Label>
            <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
              {item.text}
            </Text>
            <Text variant="caption-2" color="secondary" style={{flexShrink: 0}}>
              {item.time}
            </Text>
          </Flex>
        ))}
      </Flex>
    </WidgetCard>
  );
}

/* ---------- Note ---------- */

interface NoteData {
  title: string;
  text: string;
}

function NoteWidget({data}: PluginWidgetProps) {
  const {title, text} = data as unknown as NoteData;
  return (
    <WidgetCard title={title}>
      <Text variant="body-1" className="widget__scroll">
        {text}
      </Text>
    </WidgetCard>
  );
}

/* ---------- plugins ---------- */

export const kpiPlugin: Plugin = {
  type: WIDGET_TYPES.kpi,
  defaultLayout: {w: 9, h: 5},
  renderer: (props) => <KpiWidget {...props} />,
};

export const progressPlugin: Plugin = {
  type: WIDGET_TYPES.progress,
  defaultLayout: {w: 12, h: 8},
  renderer: (props) => <ProgressWidget {...props} />,
};

export const activityPlugin: Plugin = {
  type: WIDGET_TYPES.activity,
  defaultLayout: {w: 18, h: 9},
  renderer: (props) => <ActivityWidget {...props} />,
};

export const notePlugin: Plugin = {
  type: WIDGET_TYPES.note,
  defaultLayout: {w: 12, h: 6},
  renderer: (props) => <NoteWidget {...props} />,
};

/* ---------- default data for newly added widgets ---------- */

export const NEW_WIDGET_DATA: Record<keyof typeof WIDGET_TYPES, Record<string, unknown>> = {
  kpi: {label: 'New metric', value: '0', delta: '0%', trend: 'up'},
  progress: {
    title: 'New progress',
    items: [
      {name: 'Task A', value: 40},
      {name: 'Task B', value: 75, theme: 'success'},
    ],
  },
  activity: {
    title: 'New activity feed',
    items: [{text: 'Something happened', time: 'now', tag: 'info', theme: 'info'}],
  },
  note: {title: 'New note', text: 'Write something here.'},
};
