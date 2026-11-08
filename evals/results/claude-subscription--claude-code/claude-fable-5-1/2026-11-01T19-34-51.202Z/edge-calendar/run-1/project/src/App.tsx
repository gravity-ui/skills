import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Button, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 360 }}>
      <Text variant="header-1">Выбор даты</Text>

      <Calendar value={date} onUpdate={setDate} aria-label="Календарь для выбора даты" />

      <Flex alignItems="center" justifyContent="space-between" gap={2}>
        <Text variant="body-1" color={date ? 'primary' : 'secondary'}>
          {date ? `Выбрано: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
        </Text>
        {date && (
          <Button view="flat" size="s" onClick={() => setDate(null)}>
            Сбросить
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
