import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(() => dateTime());

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Выбор даты</Text>

      <Calendar value={date} onUpdate={setDate} aria-label="Календарь выбора даты" />

      <Text variant="body-2" color="secondary">
        {date ? `Выбрана дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
