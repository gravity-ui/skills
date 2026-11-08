import { useState } from 'react';
import { DatePicker } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [value, setValue] = useState<DateTime | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <DatePicker
        value={value}
        onUpdate={(v) => setValue(v)}
        format="DD.MM.YYYY"
      />
    </div>
  );
}
