import React from 'react';
import {Card, Label, Progress, Text} from '@gravity-ui/uikit';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';

import type {ListData, MetricData, ProgressData} from './data';

// Виджеты DashKit получают `data` из config.items. Тип данных задаём явно,
// чтобы рендер не зависел от `unknown` из ConfigItemData.
type WithData<T> = Omit<PluginWidgetProps, 'data'> & {data: T};

/** Общая оболочка виджета: заполняет ячейку сетки и даёт внутренний отступ. */
function WidgetFrame({title, children}: {title?: string; children: React.ReactNode}) {
  return (
    <Card
      type="container"
      view="outlined"
      size="l"
      width="100%"
      height="100%"
      style={{padding: 'var(--g-spacing-4)', boxSizing: 'border-box', overflow: 'hidden'}}
    >
      {title && (
        <Text variant="subheader-2" as="h3" style={{margin: 0, marginBottom: 'var(--g-spacing-3)'}}>
          {title}
        </Text>
      )}
      {children}
    </Card>
  );
}

function MetricWidget({data}: {data: MetricData}) {
  return (
    <WidgetFrame>
      <Text variant="body-2" color="secondary" as="div">
        {data.label}
      </Text>
      <Text variant="display-1" as="div" style={{marginTop: 'var(--g-spacing-2)'}}>
        {data.value}
      </Text>
      <div style={{marginTop: 'var(--g-spacing-2)'}}>
        <Label theme={data.positive ? 'success' : 'danger'} size="s">
          {data.delta}
        </Label>
      </div>
    </WidgetFrame>
  );
}

function ProgressWidget({data}: {data: ProgressData}) {
  return (
    <WidgetFrame title={data.title}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--g-spacing-3)'}}>
        {data.rows.map((row) => (
          <div key={row.name} style={{display: 'flex', flexDirection: 'column', gap: 'var(--g-spacing-1)'}}>
            <Text variant="body-1">{row.name}</Text>
            <Progress value={row.value} theme={row.theme} text={`${row.value}%`} size="m" />
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}

function ListWidget({data}: {data: ListData}) {
  return (
    <WidgetFrame title={data.title}>
      <ul style={{margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column'}}>
        {data.items.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 'var(--g-spacing-2)',
              padding: 'var(--g-spacing-2) 0',
              borderBottom: '1px solid var(--g-color-line-generic)',
            }}
          >
            <Text variant="body-1" ellipsis>
              {item.title}
            </Text>
            <Text variant="body-1" color="secondary" style={{whiteSpace: 'nowrap'}}>
              {item.meta}
            </Text>
          </li>
        ))}
      </ul>
    </WidgetFrame>
  );
}

export const metricPlugin: Plugin<WithData<MetricData>> = {
  type: 'metric',
  renderer: (props) => <MetricWidget data={props.data} />,
};

export const progressPlugin: Plugin<WithData<ProgressData>> = {
  type: 'progress',
  renderer: (props) => <ProgressWidget data={props.data} />,
};

export const listPlugin: Plugin<WithData<ListData>> = {
  type: 'list',
  renderer: (props) => <ListWidget data={props.data} />,
};
