import { useState } from 'react';
import { Calendar } from '@gravity-ui/date-components';
import { dateTimeParse } from '@gravity-ui/date-utils';
import type { DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [value, setValue] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <Calendar
        value={value}
        onUpdate={(v) => setValue(v)}
        size="l"
        minValue={dateTimeParse('2024-01-01')}
        maxValue={dateTimeParse('2026-12-31')}
      />
    </div>
  );
}
