import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import type {DateTime} from '@gravity-ui/date-utils';
import {Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
      <Text variant="header-1" as="h1" id="date-calendar-title">
        Выбор даты
      </Text>

      <Flex direction="column" gap={2} style={{alignSelf: 'flex-start'}}>
        <Calendar
          aria-labelledby="date-calendar-title"
          value={date}
          onUpdate={setDate}
          size="l"
        />

        <Text variant="body-2" color={date ? 'primary' : 'secondary'} aria-live="polite">
          {date ? `Выбранная дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
        </Text>
      </Flex>
    </Flex>
  );
}
