import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = useState<DateTime | null>(null);

  return (
    <div style={{padding: 24}}>
      <Flex direction="column" gap={4}>
        <Calendar value={value} onUpdate={setValue} />
        <Text variant="body-1" color="secondary">
          {value ? `Выбрана дата: ${value.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
        </Text>
      </Flex>
    </div>
  );
}
