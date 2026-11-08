import React from 'react';
import {Alert, Card, Flex, Label, Switch, Text, TextInput} from '@gravity-ui/uikit';

import {Page} from './Page';

const FEATURES = [
  {title: 'Навигация', text: 'Боковая панель AsideHeader с маршрутизацией между страницами.'},
  {title: 'Темы', text: 'Светлая и тёмная темы на семантических токенах --g-*.'},
  {title: 'Компоненты', text: 'Карточки, формы, метки и уведомления из @gravity-ui/uikit.'},
];

export function FeaturesPage() {
  const [name, setName] = React.useState('');
  const [notify, setNotify] = React.useState(true);

  return (
    <Page title="Возможности" description="Несколько компонентов, чтобы оценить обе темы.">
      <Flex gap={3} wrap>
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            type="container"
            view="outlined"
            style={{flex: '1 1 240px', minWidth: 0, padding: 'var(--g-spacing-4)'}}
          >
            <Flex direction="column" gap={2}>
              <Text variant="subheader-2">{f.title}</Text>
              <Text variant="body-1" color="secondary">
                {f.text}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Card type="container" view="outlined" style={{padding: 'var(--g-spacing-4)'}}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">Форма</Text>
          <TextInput
            label="Имя"
            placeholder="Введите имя"
            value={name}
            onUpdate={setName}
            style={{maxWidth: 360}}
          />
          <Switch checked={notify} onUpdate={setNotify} content="Получать уведомления" />
          <Flex gap={2} wrap>
            <Label theme="info">Информация</Label>
            <Label theme="success">Успех</Label>
            <Label theme="warning">Внимание</Label>
            <Label theme="danger">Ошибка</Label>
          </Flex>
        </Flex>
      </Card>

      <Alert
        theme="info"
        title="Подсказка"
        message={`Привет${name ? `, ${name}` : ''}! Уведомления ${notify ? 'включены' : 'выключены'}.`}
      />
    </Page>
  );
}
