import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { Text, configure } from '@gravity-ui/uikit';

configure({ lang: 'ru' });

export function App() {
  const [value, setValue] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Text variant="header-1">Выберите дату</Text>
      <Calendar
        value={value}
        onUpdate={setValue}
        defaultFocusedValue={dateTime()}
        aria-label="Календарь для выбора даты"
      />
      <Text variant="body-2" color={value ? 'primary' : 'secondary'}>
        {value ? `Выбрана дата: ${value.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </div>
  );
}
