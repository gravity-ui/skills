import {useState} from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTimeParse, type DateTime} from '@gravity-ui/date-utils';
import {Text} from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = useState<DateTime | null>(dateTimeParse('2024-01-01') ?? null);

  return (
    <div style={{padding: 24}}>
      <Text variant="header-1" style={{marginBottom: 16}}>
        Календарь
      </Text>
      <Calendar
        value={value}
        onUpdate={setValue}
        size="l"
        modes={{days: true, months: true, years: true}}
      />
    </div>
  );
}
