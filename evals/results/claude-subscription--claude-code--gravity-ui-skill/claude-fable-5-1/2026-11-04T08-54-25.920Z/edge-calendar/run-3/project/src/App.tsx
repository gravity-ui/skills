import React from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = React.useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <Text variant="header-1">Выбор даты</Text>

      <Calendar aria-label="Календарь выбора даты" value={date} onUpdate={setDate} />

      <Text variant="body-2">
        {date ? `Выбранная дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
