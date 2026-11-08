import React from 'react';

import {Calendar} from '@gravity-ui/date-components';
import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Button, Card, Text} from '@gravity-ui/uikit';

export function App() {
  const [value, setValue] = React.useState<DateTime | null>(dateTime());

  return (
    <div style={{padding: 24, maxWidth: 480, margin: '0 auto'}}>
      <Text variant="header-1" as="h1">
        Выбор даты
      </Text>

      <Card style={{padding: 16, marginTop: 16, display: 'inline-block'}}>
        <Calendar value={value} onUpdate={setValue} />
      </Card>

      <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 12}}>
        <Text variant="body-2">
          Выбранная дата: {value ? value.format('DD.MM.YYYY') : 'не выбрана'}
        </Text>
        <Button view="outlined" size="m" onClick={() => setValue(dateTime())}>
          Сегодня
        </Button>
        <Button view="flat" size="m" onClick={() => setValue(null)}>
          Сбросить
        </Button>
      </div>
    </div>
  );
}
