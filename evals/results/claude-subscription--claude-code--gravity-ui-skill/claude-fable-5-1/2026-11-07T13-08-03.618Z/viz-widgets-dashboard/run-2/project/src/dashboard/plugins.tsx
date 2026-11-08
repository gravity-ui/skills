import {DashKit, pluginText, pluginTitle} from '@gravity-ui/dashkit';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import {Checkbox, Flex, Icon, Label, Progress, Table, Text} from '@gravity-ui/uikit';
import type {ProgressTheme, TableColumnConfig} from '@gravity-ui/uikit';

import {WidgetType} from './types';
import type {MeterData, OrderRow, StatData, TableData, TasksData} from './types';

/** Общая карточка-обёртка: тянется на всю ячейку сетки, тело скроллится внутри. */
function WidgetFrame({title, children}: {title?: string; children: React.ReactNode}) {
  return (
    <div className="dashboard-widget">
      {title ? (
        <div className="dashboard-widget__header">
          <Text variant="subheader-2" ellipsis>
            {title}
          </Text>
        </div>
      ) : null}
      <div className="dashboard-widget__body">{children}</div>
    </div>
  );
}

// ---------- Stat tile ----------

function StatWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as StatData;
  const direction = data.direction ?? 'up';
  const isGood = (data.upIsGood ?? true) === (direction === 'up');
  const deltaClass = isGood ? 'dashboard-stat__delta_good' : 'dashboard-stat__delta_bad';

  return (
    <WidgetFrame>
      <div className="dashboard-stat">
        <Text variant="body-1" color="secondary" ellipsis>
          {data.label}
        </Text>
        <Text variant="display-2" className="dashboard-stat__value">
          {data.value}
        </Text>
        {data.delta ? (
          <Flex alignItems="center" gap={1} className={`dashboard-stat__delta ${deltaClass}`}>
            <Icon data={direction === 'up' ? ArrowUp : ArrowDown} size={14} />
            <Text variant="body-1">{data.delta}</Text>
            {data.period ? (
              <Text variant="body-1" color="secondary">
                {data.period}
              </Text>
            ) : null}
          </Flex>
        ) : null}
      </div>
    </WidgetFrame>
  );
}

// ---------- Meter list ----------

function meterTheme(value: number): ProgressTheme {
  if (value >= 90) return 'danger';
  if (value >= 75) return 'warning';
  return 'default';
}

function MeterWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as MeterData;
  return (
    <WidgetFrame title={data.title}>
      <Flex direction="column" gap={3}>
        {data.rows.map((row) => (
          <div key={row.name}>
            <Flex justifyContent="space-between" gap={2}>
              <Text variant="body-1" ellipsis style={{flex: 1, minWidth: 0}}>
                {row.name}
              </Text>
              <Text variant="body-1" color="secondary" style={{flexShrink: 0}}>
                {row.value}
                {row.unit ?? '%'}
              </Text>
            </Flex>
            <Progress value={row.value} size="s" theme={meterTheme(row.value)} />
          </div>
        ))}
      </Flex>
    </WidgetFrame>
  );
}

// ---------- Table ----------

const statusLabel: Record<OrderRow['status'], {theme: 'success' | 'warning' | 'danger'; text: string}> = {
  paid: {theme: 'success', text: 'Оплачен'},
  pending: {theme: 'warning', text: 'Ожидает'},
  failed: {theme: 'danger', text: 'Ошибка'},
};

const orderColumns: TableColumnConfig<OrderRow>[] = [
  {id: 'id', name: '№', width: 80},
  {id: 'customer', name: 'Клиент'},
  {id: 'amount', name: 'Сумма', align: 'end'},
  {
    id: 'status',
    name: 'Статус',
    template: (row) => (
      <Label theme={statusLabel[row.status].theme} size="xs">
        {statusLabel[row.status].text}
      </Label>
    ),
  },
];

function TableWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as TableData;
  return (
    <WidgetFrame title={data.title}>
      <Table data={data.rows} columns={orderColumns} getRowId="id" emptyMessage="Нет данных" />
    </WidgetFrame>
  );
}

// ---------- Tasks ----------

function TasksWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as TasksData;
  const done: Record<string, boolean> = (props.state?.done as Record<string, boolean>) ?? {};
  const doneCount = data.tasks.filter((t) => done[t.id]).length;

  const toggle = (id: string, checked: boolean) => {
    props.onStateAndParamsChange({state: {done: {...done, [id]: checked}}});
  };

  return (
    <WidgetFrame title={`${data.title} · ${doneCount}/${data.tasks.length}`}>
      <Flex direction="column" gap={2}>
        {data.tasks.map((task) => (
          <Checkbox
            key={task.id}
            size="m"
            checked={Boolean(done[task.id])}
            onUpdate={(checked) => toggle(task.id, checked)}
            content={
              <Text variant="body-1" color={done[task.id] ? 'secondary' : 'primary'}>
                {task.text}
              </Text>
            }
          />
        ))}
      </Flex>
    </WidgetFrame>
  );
}

// ---------- Registration ----------

const customPlugins: Plugin[] = [
  {type: WidgetType.Stat, defaultLayout: {w: 9, h: 6, minW: 6, minH: 5}, renderer: (p) => <StatWidget {...p} />},
  {type: WidgetType.Meter, defaultLayout: {w: 12, h: 12, minW: 8, minH: 6}, renderer: (p) => <MeterWidget {...p} />},
  {type: WidgetType.Table, defaultLayout: {w: 20, h: 14, minW: 12, minH: 6}, renderer: (p) => <TableWidget {...p} />},
  {type: WidgetType.Tasks, defaultLayout: {w: 12, h: 12, minW: 8, minH: 6}, renderer: (p) => <TasksWidget {...p} />},
];

/**
 * Регистрация идемпотентна (`reloadPlugins`), чтобы повторный импорт модуля при HMR
 * не падал на «тип уже был зарегистрирован».
 */
export function registerDashboardPlugins() {
  DashKit.reloadPlugins(pluginTitle, pluginText, ...customPlugins);
}
