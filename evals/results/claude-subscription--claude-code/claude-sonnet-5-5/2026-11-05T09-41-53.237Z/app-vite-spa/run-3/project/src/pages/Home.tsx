import { useState } from 'react';
import { Button, Card, Text } from '@gravity-ui/uikit';

import { href } from '../router';

export function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Text variant="display-1">Привет!</Text>
      <Text variant="body-2" color="secondary">
        Небольшое приложение из трёх страниц: переключайтесь между ними в шапке и меняйте светлую
        или тёмную тему — выбор запоминается.
      </Text>
      <Card view="outlined" type="container" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button view="action" onClick={() => setCount((c) => c + 1)}>
            Нажато: {count}
          </Button>
          <Button view="outlined" disabled={count === 0} onClick={() => setCount(0)}>
            Сбросить
          </Button>
        </div>
      </Card>
      <div>
        <Button view="outlined" href={href('/tasks')}>
          Перейти к задачам →
        </Button>
      </div>
    </>
  );
}
