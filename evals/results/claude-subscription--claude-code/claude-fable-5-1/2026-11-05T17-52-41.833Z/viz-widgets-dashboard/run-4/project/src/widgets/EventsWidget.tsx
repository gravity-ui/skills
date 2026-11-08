import { Icon, Label, Table, Text } from '@gravity-ui/uikit';
import { CircleCheck, CircleExclamation, TriangleExclamation } from '@gravity-ui/icons';
import { useMemo } from 'react';

import { getEvents, type EventRow, type EventStatus } from './data';
import { formatTime } from './format';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetProps } from './types';

const STATUS: Record<EventStatus, { text: string; theme: 'success' | 'warning' | 'danger'; icon: typeof CircleCheck }> = {
  ok: { text: 'ок', theme: 'success', icon: CircleCheck },
  warning: { text: 'внимание', theme: 'warning', icon: TriangleExclamation },
  error: { text: 'ошибка', theme: 'danger', icon: CircleExclamation },
};

const columns = [
  {
    id: 'time',
    name: 'Время',
    width: 64,
    template: (row: EventRow) => (
      <Text color="secondary" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatTime(row.time)}
      </Text>
    ),
  },
  { id: 'title', name: 'Событие', primary: true },
  {
    id: 'service',
    name: 'Сервис',
    template: (row: EventRow) => <Text color="secondary">{row.service}</Text>,
  },
  {
    id: 'status',
    name: 'Статус',
    width: 110,
    template: (row: EventRow) => {
      const s = STATUS[row.status];
      return (
        <Label theme={s.theme} size="xs" icon={<Icon data={s.icon} size={12} />}>
          {s.text}
        </Label>
      );
    },
  },
];

export function EventsWidget(frame: WidgetProps) {
  const data = useMemo(() => getEvents(), []);
  return (
    <WidgetFrame {...frame} subtitle="Последние уведомления систем">
      <div style={{ height: '100%', overflow: 'auto', margin: '0 -14px', padding: '0 14px' }}>
        <Table data={data} columns={columns} getRowId={(row) => row.id} verticalAlign="middle" />
      </div>
    </WidgetFrame>
  );
}
