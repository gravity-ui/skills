import { useState } from 'react';
import { Card, Flex, Text } from '@gravity-ui/uikit';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime } from '@gravity-ui/date-utils';
import type { DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [date, setDate] = useState<DateTime | null>(() => dateTime());

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 480 }}>
      <Text variant="header-1" as="h1">
        Выбор даты
      </Text>

      <Card view="outlined" style={{ padding: 16 }}>
        <Flex direction="column" gap={3} alignItems="flex-start">
          <Calendar
            aria-label="Календарь выбора даты"
            value={date}
            onUpdate={setDate}
            size="l"
          />
          <Text variant="body-2" color="secondary">
            Выбранная дата:{' '}
            <Text variant="body-2" color="primary">
              {date ? date.format('DD.MM.YYYY') : 'не выбрана'}
            </Text>
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
