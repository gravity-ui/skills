import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <Text variant="header-1">Выбор даты</Text>
      <div>
        <Calendar value={value} onUpdate={setValue} aria-label="Календарь для выбора даты" />
      </div>
      <Text variant="body-2" color="secondary">
        {value ? `Выбрана дата: ${value.format('D MMMM YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
