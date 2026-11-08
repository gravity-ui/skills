import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Box, Flex, Text} from '@gravity-ui/uikit';

export function App() {
  const [selected, setSelected] = useState<DateTime | null>(() => dateTime());

  return (
    <Box spacing={{p: 6}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Select a date</Text>
        <Calendar value={selected} onUpdate={setSelected} />
        <Text variant="body-2">
          Selected: {selected ? selected.format('DD.MM.YYYY') : 'none'}
        </Text>
      </Flex>
    </Box>
  );
}
