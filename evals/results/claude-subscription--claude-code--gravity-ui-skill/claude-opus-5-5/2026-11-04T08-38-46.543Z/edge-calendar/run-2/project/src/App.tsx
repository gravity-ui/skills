import React from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { Card, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = React.useState<DateTime | null>(() => dateTime());

  return (
    <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-6)' }}>
      <Text variant="header-1">Выбор даты</Text>
      <Card view="outlined" style={{ alignSelf: 'flex-start', padding: 'var(--g-spacing-4)' }}>
        <Calendar aria-label="Календарь" value={value} onUpdate={setValue} />
      </Card>
      <Text variant="body-1" color="secondary">
        Выбранная дата: {value ? value.format('D MMMM YYYY') : 'не выбрана'}
      </Text>
    </Flex>
  );
}
