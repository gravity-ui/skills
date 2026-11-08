import React from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

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
      <Text variant="header-1">Выберите дату</Text>
      <Calendar value={value} onUpdate={setValue} />
      <Text variant="body-2" color="secondary">
        {value ? `Выбрано: ${value.format('D MMMM YYYY')}` : 'Дата не выбрана'}
      </Text>
    </div>
  );
}
