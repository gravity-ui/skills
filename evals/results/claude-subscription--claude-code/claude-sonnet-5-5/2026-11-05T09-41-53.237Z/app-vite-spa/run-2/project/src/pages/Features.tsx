import React from 'react';
import { Button, Card, Text } from '@gravity-ui/uikit';

const FEATURES = [
  { title: 'Навигация', text: 'Переход между страницами через hash-роутер, работает кнопка «Назад».' },
  { title: 'Две темы', text: 'Светлая и тёмная темы Gravity UI, по умолчанию — как в системе.' },
  { title: 'Запоминание', text: 'Выбранная тема сохраняется в localStorage.' },
];

export function Features() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="stack">
      <Text variant="display-1" as="h1">
        Возможности
      </Text>
      <div className="grid">
        {FEATURES.map((f) => (
          <Card key={f.title} type="container" view="outlined" className="card">
            <Text variant="subheader-2">{f.title}</Text>
            <Text as="p" color="secondary">
              {f.text}
            </Text>
          </Card>
        ))}
      </div>
      <Card type="container" view="filled" className="card">
        <Text variant="subheader-2">Счётчик</Text>
        <Text as="p">Нажатий: {count}</Text>
        <div className="row">
          <Button view="action" onClick={() => setCount((c) => c + 1)}>
            Увеличить
          </Button>
          <Button view="outlined" onClick={() => setCount(0)} disabled={count === 0}>
            Сбросить
          </Button>
        </div>
      </Card>
    </div>
  );
}
