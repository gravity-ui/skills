import React from 'react';
import {Button, Card, Flex, Icon, Label, Text} from '@gravity-ui/uikit';
import {ChartColumn, Gear} from '@gravity-ui/icons';

import {PageShell} from './PageShell';
import type {Route} from '../router';

interface HomePageProps {
  onNavigate: (route: Route) => void;
}

export function HomePage({onNavigate}: HomePageProps) {
  return (
    <PageShell
      title="Главная"
      description="Небольшое демо-приложение на Gravity UI: три страницы, навигация в боковой панели и переключатель темы."
    >
      <Flex gap={4} wrap>
        <Card type="container" view="filled" spacing={{p: 5}} style={{flex: '1 1 280px', minWidth: 0}}>
          <Flex direction="column" gap={3} alignItems="flex-start">
            <Label theme="info" size="s">
              Шаг 1
            </Label>
            <Text variant="subheader-2">Навигация</Text>
            <Text variant="body-1" color="secondary">
              Пункты меню слева переключают страницы. Маршрут хранится в хэше адреса, поэтому
              работают кнопки «назад» и «вперёд».
            </Text>
            <Button view="action" size="m" onClick={() => onNavigate('projects')}>
              <Icon data={ChartColumn} size={16} />
              Открыть проекты
            </Button>
          </Flex>
        </Card>

        <Card type="container" view="filled" spacing={{p: 5}} style={{flex: '1 1 280px', minWidth: 0}}>
          <Flex direction="column" gap={3} alignItems="flex-start">
            <Label theme="utility" size="s">
              Шаг 2
            </Label>
            <Text variant="subheader-2">Тема</Text>
            <Text variant="body-1" color="secondary">
              Светлую и тёмную тему можно переключить в нижней части боковой панели или на
              странице настроек. Выбор сохраняется между визитами.
            </Text>
            <Button view="outlined" size="m" onClick={() => onNavigate('settings')}>
              <Icon data={Gear} size={16} />
              Перейти в настройки
            </Button>
          </Flex>
        </Card>
      </Flex>
    </PageShell>
  );
}
