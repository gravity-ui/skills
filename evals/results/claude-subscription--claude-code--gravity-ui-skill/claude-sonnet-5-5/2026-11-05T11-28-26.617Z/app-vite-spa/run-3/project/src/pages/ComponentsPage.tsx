import React from 'react';
import { Button, Card, Flex, Label, Switch, Text, TextInput } from '@gravity-ui/uikit';

export function ComponentsPage() {
  const [name, setName] = React.useState('');
  const [notifications, setNotifications] = React.useState(true);

  return (
    <div className="page">
      <Flex direction="column" gap={6}>
        <Text variant="header-1">Компоненты</Text>

        <Card type="container" view="outlined" className="page__card">
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Кнопки</Text>
            <Flex gap={2} wrap>
              <Button view="action">Action</Button>
              <Button view="normal">Normal</Button>
              <Button view="outlined">Outlined</Button>
              <Button view="flat">Flat</Button>
              <Button view="outlined-danger">Danger</Button>
            </Flex>
          </Flex>
        </Card>

        <Card type="container" view="outlined" className="page__card">
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Метки</Text>
            <Flex gap={2} wrap>
              <Label theme="normal">Normal</Label>
              <Label theme="info">Info</Label>
              <Label theme="success">Success</Label>
              <Label theme="warning">Warning</Label>
              <Label theme="danger">Danger</Label>
            </Flex>
          </Flex>
        </Card>

        <Card type="container" view="outlined" className="page__card">
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Форма</Text>
            <TextInput
              label="Имя"
              placeholder="Введите имя"
              value={name}
              onUpdate={setName}
              hasClear
            />
            <Switch checked={notifications} onUpdate={setNotifications} content="Уведомления" />
            <Text variant="body-1" color="secondary">
              {name ? `Привет, ${name}!` : 'Введите имя, чтобы поздороваться.'}
            </Text>
          </Flex>
        </Card>
      </Flex>
    </div>
  );
}
