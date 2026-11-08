import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Flex, Text, configure } from '@gravity-ui/uikit';

configure({ lang: 'ru' });

export function App() {
  const [value, setValue] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Выберите дату</Text>
      <Calendar value={value} onUpdate={setValue} />
      <Text variant="body-2">
        {value ? `Выбрана дата: ${value.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
