import React from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Box, Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = React.useState<DateTime | null>(null);

  return (
    <Box spacing={{p: 6}}>
      <Flex direction="column" gap={4} alignItems="flex-start">
        <Text variant="header-1">Выбор даты</Text>
        <Calendar value={value} onUpdate={setValue} />
        <Text variant="body-2" color="secondary">
          {value ? `Выбрана дата: ${value.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
        </Text>
      </Flex>
    </Box>
  );
}
