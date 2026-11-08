import React from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Text, sp} from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = React.useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={5} className={sp({p: 6})}>
      <Text variant="header-1">Выбор даты</Text>
      <Calendar value={date} onUpdate={setDate} size="l" aria-label="Календарь" />
      <Text variant="body-1">
        {date ? `Выбранная дата: ${date.format('D MMMM YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
