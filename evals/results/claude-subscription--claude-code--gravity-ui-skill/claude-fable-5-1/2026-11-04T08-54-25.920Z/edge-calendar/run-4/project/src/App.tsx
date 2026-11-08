import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-6)', maxWidth: 480 }}>
      <Text variant="header-1">Pick a date</Text>

      <Card view="outlined" style={{ padding: 'var(--g-spacing-4)', alignSelf: 'flex-start' }}>
        <Calendar
          aria-label="Date picker"
          size="l"
          value={date}
          onUpdate={setDate}
        />
      </Card>

      <Flex alignItems="center" gap={3}>
        <Text variant="body-2" style={{ flex: 1, minWidth: 0 }}>
          {date ? (
            <>
              Selected date: <Text variant="subheader-2">{date.format('LL')}</Text>
            </>
          ) : (
            <Text color="secondary">No date selected</Text>
          )}
        </Text>
        <Button view="flat" disabled={!date} onClick={() => setDate(null)} style={{ flexShrink: 0 }}>
          Clear
        </Button>
      </Flex>
    </Flex>
  );
}
