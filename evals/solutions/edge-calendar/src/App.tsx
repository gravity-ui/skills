import { useState } from 'react';

import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';
import { Text } from '@gravity-ui/uikit';

// Inline calendar for picking a date. `Calendar` lives in @gravity-ui/date-components
// (NOT in @gravity-ui/uikit) and works with DateTime values from @gravity-ui/date-utils.
export function App() {
  const [date, setDate] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Text variant="header-1">Выбор даты</Text>
      <Calendar value={date} onUpdate={setDate} />
      <Text color="secondary">
        {date ? `Выбранная дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
      </Text>
    </div>
  );
}
