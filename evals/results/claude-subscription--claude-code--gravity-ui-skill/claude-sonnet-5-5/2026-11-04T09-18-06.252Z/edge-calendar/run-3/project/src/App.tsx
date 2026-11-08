import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} alignItems="flex-start" style={{padding: 24}}>
      <Text variant="header-1">Выбор даты</Text>
      <Calendar value={date} onUpdate={setDate} aria-label="Календарь" />
      <Text variant="body-1" color="secondary">
        {date ? `Выбрана дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
