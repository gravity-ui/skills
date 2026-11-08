import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { type DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

export function App() {
  const [selected, setSelected] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">Select a date</Text>

      <Calendar value={selected} onUpdate={setSelected} />

      <Text variant="body-2" color="secondary">
        {selected ? `Selected: ${selected.format('LL')}` : 'No date selected'}
      </Text>
    </div>
  );
}
