import {useEffect, useState} from 'react';
import {Card, Text} from '@gravity-ui/uikit';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime, settings, type DateTime} from '@gravity-ui/date-utils';

export function App() {
  // Re-render once the Russian locale is loaded so dates are re-formatted
  const [, setLocaleReady] = useState(false);
  const [date, setDate] = useState<DateTime>(() => dateTime());

  useEffect(() => {
    let mounted = true;
    settings.loadLocale('ru').then(() => {
      settings.setLocale('ru');
      if (mounted) {
        setLocaleReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <Text variant="header-1">Выбор даты</Text>
      <Card style={{padding: 16}}>
        <Calendar value={date} onUpdate={setDate} size="l" />
      </Card>
      <Text variant="body-1" color="secondary">
        Выбранная дата: {date.format('D MMMM YYYY')}
      </Text>
    </div>
  );
}
