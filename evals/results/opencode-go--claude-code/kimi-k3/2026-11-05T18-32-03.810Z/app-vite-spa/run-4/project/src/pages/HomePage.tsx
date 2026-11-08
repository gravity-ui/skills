import React from 'react';
import {Button, Card, Text} from '@gravity-ui/uikit';

import type {Route} from '../router';

interface HomePageProps {
  onNavigate: (route: Route) => void;
}

export function HomePage({onNavigate}: HomePageProps) {
  const [count, setCount] = React.useState(0);

  return (
    <div className="page">
      <Text variant="header-1">Добро пожаловать 👋</Text>
      <Text variant="body-2" color="secondary">
        Это небольшое демо-приложение с навигацией между страницами и переключением темы.
      </Text>

      <Card view="raised" className="page__card">
        <Text variant="subheader-2">Счётчик</Text>
        <Text variant="body-2" color="secondary">
          Просто чтобы было с чем поиграться:
        </Text>
        <div className="counter">
          <Button view="outlined" size="l" onClick={() => setCount((c) => c - 1)}>
            −
          </Button>
          <Text variant="display-2" className="counter__value">
            {count}
          </Text>
          <Button view="outlined" size="l" onClick={() => setCount((c) => c + 1)}>
            +
          </Button>
        </div>
      </Card>

      <div className="page__actions">
        <Button view="action" size="l" onClick={() => onNavigate('about')}>
          Узнать больше
        </Button>
        <Button view="outlined" size="l" onClick={() => onNavigate('settings')}>
          Перейти в настройки
        </Button>
      </div>
    </div>
  );
}
