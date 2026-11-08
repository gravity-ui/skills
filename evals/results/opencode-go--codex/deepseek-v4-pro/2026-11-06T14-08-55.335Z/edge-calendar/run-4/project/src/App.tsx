import React from 'react';
import { Calendar } from '@gravity-ui/date-components';
import type { DateTime } from '@gravity-ui/date-utils';

export function App() {
  const [value, setValue] = React.useState<DateTime>();

  return (
    <div style={{ padding: 24 }}>
      <Calendar value={value} onUpdate={setValue} size="m" />
    </div>
  );
}
