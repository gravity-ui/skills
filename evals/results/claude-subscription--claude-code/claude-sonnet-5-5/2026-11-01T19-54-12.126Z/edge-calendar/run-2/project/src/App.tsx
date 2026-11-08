import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Calendar value={date} onUpdate={setDate} />
      <Text variant="body-2">
        {date ? `Выбрана дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </div>
  );
}
