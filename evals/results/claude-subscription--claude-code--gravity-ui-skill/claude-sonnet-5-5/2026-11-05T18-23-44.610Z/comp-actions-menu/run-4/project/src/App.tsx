import { Button, DropdownMenu, Flex, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';
import { useState } from 'react';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    [
      { text: 'Редактировать', action: () => setLastAction('Редактировать') },
      { text: 'Дублировать', action: () => setLastAction('Дублировать') },
      { text: 'Поделиться', action: () => setLastAction('Поделиться') },
    ],
    [
      {
        text: 'Удалить',
        theme: 'danger',
        action: () => setLastAction('Удалить'),
      },
    ],
  ];

  return (
    <Flex direction="column" alignItems="flex-start" gap={4} style={{ padding: 24 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button view="outlined" {...props}>
            Действия
          </Button>
        )}
      />
      <Text variant="body-1" color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Действие не выбрано'}
      </Text>
    </Flex>
  );
}
