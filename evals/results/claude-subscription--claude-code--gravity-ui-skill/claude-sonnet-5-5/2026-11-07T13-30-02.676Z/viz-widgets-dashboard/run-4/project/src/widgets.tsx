import {Card, Checkbox, Flex, Label, Progress, Text} from '@gravity-ui/uikit';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

// Виджет — это плагин DashKit: тип + размер по умолчанию + renderer.
// Содержимое берётся из `data` элемента конфига.

const fill = {height: '100%', boxSizing: 'border-box'} as const;

type KpiData = {title: string; value: string; delta: number};

function KpiWidget({data}: PluginWidgetProps) {
  const {title, value, delta} = data as KpiData;
  const positive = delta >= 0;
  return (
    <Card type="container" view="outlined" style={fill}>
      <Flex direction="column" justifyContent="space-between" gap={2} style={{...fill, padding: 16}}>
        <Text variant="subheader-1" color="secondary" ellipsis>
          {title}
        </Text>
        <Text variant="display-2">{value}</Text>
        <div>
          <Label theme={positive ? 'success' : 'danger'} size="s">
            {positive ? '+' : ''}
            {delta}% к прошлой неделе
          </Label>
        </div>
      </Flex>
    </Card>
  );
}

type ProgressData = {title: string; items: {name: string; value: number}[]};

function ProgressWidget({data}: PluginWidgetProps) {
  const {title, items} = data as ProgressData;
  return (
    <Card type="container" view="outlined" style={fill}>
      <Flex direction="column" gap={3} style={{...fill, padding: 16, overflowY: 'auto'}}>
        <Text variant="subheader-2">{title}</Text>
        {items.map((item) => (
          <Flex key={item.name} direction="column" gap={1}>
            <Flex justifyContent="space-between" gap={2}>
              <Text style={{flex: 1, minWidth: 0}} ellipsis>
                {item.name}
              </Text>
              <Text color="secondary" style={{flexShrink: 0}}>
                {item.value}%
              </Text>
            </Flex>
            <Progress
              value={item.value}
              size="s"
              colorStops={[
                {theme: 'danger', stop: 30},
                {theme: 'warning', stop: 70},
                {theme: 'success', stop: 100},
              ]}
            />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

type TasksData = {title: string; tasks: {id: string; text: string}[]};

function TasksWidget({data, state, onStateAndParamsChange}: PluginWidgetProps) {
  const {title, tasks} = data as TasksData;
  const done: string[] = state?.done ?? [];

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...done, id] : done.filter((x) => x !== id);
    onStateAndParamsChange({state: {done: next}});
  };

  return (
    <Card type="container" view="outlined" style={fill}>
      <Flex direction="column" gap={3} style={{...fill, padding: 16, overflowY: 'auto'}}>
        <Text variant="subheader-2">{title}</Text>
        {tasks.map((task) => (
          <Checkbox
            key={task.id}
            size="m"
            checked={done.includes(task.id)}
            onUpdate={(checked) => toggle(task.id, checked)}
            content={task.text}
          />
        ))}
      </Flex>
    </Card>
  );
}

type ActivityData = {
  title: string;
  events: {id: string; text: string; time: string}[];
};

function ActivityWidget({data}: PluginWidgetProps) {
  const {title, events} = data as ActivityData;
  return (
    <Card type="container" view="outlined" style={fill}>
      <Flex direction="column" gap={3} style={{...fill, padding: 16, overflowY: 'auto'}}>
        <Text variant="subheader-2">{title}</Text>
        {events.map((event) => (
          <Flex key={event.id} gap={3} alignItems="baseline">
            <Text color="secondary" style={{flexShrink: 0, width: 48}}>
              {event.time}
            </Text>
            <Text style={{flex: 1, minWidth: 0}}>{event.text}</Text>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}

export const WIDGET_TYPES = {
  kpi: 'kpi',
  progress: 'progress',
  tasks: 'tasks',
  activity: 'activity',
} as const;

export type WidgetType = keyof typeof WIDGET_TYPES;

export const kpiPlugin: Plugin = {
  type: WIDGET_TYPES.kpi,
  defaultLayout: {w: 9, h: 7},
  renderer: (props) => <KpiWidget {...props} />,
};

export const progressPlugin: Plugin = {
  type: WIDGET_TYPES.progress,
  defaultLayout: {w: 12, h: 12},
  renderer: (props) => <ProgressWidget {...props} />,
};

export const tasksPlugin: Plugin = {
  type: WIDGET_TYPES.tasks,
  defaultLayout: {w: 12, h: 12},
  renderer: (props) => <TasksWidget {...props} />,
};

export const activityPlugin: Plugin = {
  type: WIDGET_TYPES.activity,
  defaultLayout: {w: 12, h: 12},
  renderer: (props) => <ActivityWidget {...props} />,
};

// Данные нового виджета, добавленного перетаскиванием из панели.
export const DEFAULT_DATA: Record<string, Record<string, unknown>> = {
  kpi: {title: 'Новая метрика', value: '0', delta: 0},
  progress: {
    title: 'Новый список',
    items: [
      {name: 'Первый пункт', value: 40},
      {name: 'Второй пункт', value: 80},
    ],
  },
  tasks: {
    title: 'Новые задачи',
    tasks: [
      {id: 'a', text: 'Первая задача'},
      {id: 'b', text: 'Вторая задача'},
    ],
  },
  activity: {
    title: 'Новая лента',
    events: [{id: 'a', text: 'Событие', time: '12:00'}],
  },
  title: {text: 'Новый заголовок', size: 'm'},
};
