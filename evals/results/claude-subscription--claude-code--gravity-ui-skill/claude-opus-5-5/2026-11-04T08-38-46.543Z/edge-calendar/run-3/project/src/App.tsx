import * as React from 'react';

import { Calendar } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { Box, Button, Card, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = React.useState<DateTime | null>(() => dateTime());

  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4} alignItems="flex-start">
        <Text variant="header-1">Выбор даты</Text>

        <Card view="outlined" spacing={{ p: 4 }}>
          <Calendar
            value={value}
            onUpdate={setValue}
            aria-label="Календарь для выбора даты"
          />
        </Card>

        <Flex gap={3} alignItems="center" wrap>
          <Text variant="body-2" color="secondary">
            Выбранная дата:
          </Text>
          <Text variant="body-2">{value ? value.format('DD.MM.YYYY') : 'не выбрана'}</Text>
          <Button view="flat" size="s" disabled={!value} onClick={() => setValue(null)}>
            Сбросить
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
