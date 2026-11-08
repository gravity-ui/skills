import { useState } from 'react';
import { Button, DropdownMenu, Flex, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Nested arrays are rendered as visually separated groups.
  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    [
      { text: 'Редактировать', action: () => setLastAction('Редактировать') },
      { text: 'Дублировать', action: () => setLastAction('Дублировать') },
      { text: 'Поделиться', action: () => setLastAction('Поделиться') },
      { text: 'Архивировать', action: () => setLastAction('Архивировать'), disabled: true },
    ],
    [{ text: 'Удалить', action: () => setLastAction('Удалить'), theme: 'danger' }],
  ];

  return (
    <Flex direction="column" alignItems="flex-start" gap={3} style={{ padding: 24 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button {...props} view="action">
            Действия
          </Button>
        )}
      />
      <Text color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Действие не выбрано'}
      </Text>
    </Flex>
  );
}
