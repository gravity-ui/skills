import React from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const items: (DropdownMenuItem | DropdownMenuItem[])[] = [
    { text: 'Редактировать', action: () => setLastAction('Редактировать') },
    { text: 'Дублировать', action: () => setLastAction('Дублировать') },
    { text: 'Поделиться', action: () => setLastAction('Поделиться') },
    [
      {
        text: 'Удалить',
        theme: 'danger',
        action: () => setLastAction('Удалить'),
      },
    ],
  ];

  return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button view="outlined" {...props}>
            Действия
          </Button>
        )}
      />
      {lastAction && <Text color="secondary">Выбрано: {lastAction}</Text>}
    </div>
  );
}
