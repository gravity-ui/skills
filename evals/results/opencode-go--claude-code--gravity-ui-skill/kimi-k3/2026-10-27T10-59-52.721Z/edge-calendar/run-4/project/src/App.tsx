import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';

export function App() {
  const [value, setValue] = React.useState<DateTime | null>(null);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <Text variant="header-1">Выбор даты</Text>
      <Calendar value={value} onUpdate={setValue} />
      <Text variant="body-1" color="secondary">
        {value ? `Выбранная дата: ${value.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </div>
  );
}
