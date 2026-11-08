import React from 'react';

import {Calendar} from '@gravity-ui/date-components';
import {settings} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Card, Text, configure} from '@gravity-ui/uikit';

configure({lang: 'ru'});
settings.loadLocale('ru').then(() => {
  settings.setLocale('ru');
});

export function App() {
  const [date, setDate] = React.useState<DateTime | null>(null);

  return (
    <div style={{padding: 24}}>
      <Card style={{display: 'inline-block', padding: 16}}>
        <Calendar value={date} onUpdate={setDate} size="l" />
      </Card>
      <div style={{marginTop: 16}}>
        <Text variant="body-2">
          {date ? `Выбранная дата: ${date.format('DD.MM.YYYY')}` : 'Дата не выбрана'}
        </Text>
      </div>
    </div>
  );
}
