import React from 'react';
import {Calendar} from '@gravity-ui/date-components';
import {dateTime, settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Card, Flex, Text, configure} from '@gravity-ui/uikit';

configure({lang: 'ru'});

export function App() {
  const [localeReady, setLocaleReady] = React.useState(false);
  const [value, setValue] = React.useState<DateTime | null>(() => dateTime());

  React.useEffect(() => {
    let cancelled = false;
    settings.loadLocale('ru').then(() => {
      if (cancelled) return;
      settings.setLocale('ru');
      setLocaleReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Flex direction="column" alignItems="center" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
      <Text variant="header-1">Выбор даты</Text>
      {localeReady && (
        <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-4)'}}>
          <Calendar
            size="l"
            value={value}
            onUpdate={setValue}
            aria-label="Календарь для выбора даты"
          />
        </Card>
      )}
      <Text variant="body-2" color="secondary">
        {value ? `Выбрано: ${value.format('D MMMM YYYY')}` : 'Дата не выбрана'}
      </Text>
    </Flex>
  );
}
