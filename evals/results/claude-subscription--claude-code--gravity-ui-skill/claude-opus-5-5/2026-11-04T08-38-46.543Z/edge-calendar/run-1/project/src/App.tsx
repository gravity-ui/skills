import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTime, type DateTime } from '@gravity-ui/date-utils';
import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-6)' }}>
      <Text variant="header-1">Выбор даты</Text>

      <Card view="outlined" style={{ alignSelf: 'flex-start', padding: 'var(--g-spacing-4)' }}>
        <Flex direction="column" gap={3}>
          <Calendar
            aria-label="Календарь для выбора даты"
            value={selectedDate}
            onUpdate={setSelectedDate}
            defaultFocusedValue={dateTime()}
          />

          <Flex alignItems="center" justifyContent="space-between" gap={2}>
            <Text variant="body-1" color={selectedDate ? 'primary' : 'secondary'}>
              {selectedDate
                ? `Выбрано: ${selectedDate.format('DD.MM.YYYY')}`
                : 'Дата не выбрана'}
            </Text>
            <Button view="flat" disabled={!selectedDate} onClick={() => setSelectedDate(null)}>
              Сбросить
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
