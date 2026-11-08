import { useState } from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items: DropdownMenuItem<void>[][] = [
    [
      {
        text: 'Редактировать',
        action: () => setLastAction('Редактировать'),
      },
      {
        text: 'Дублировать',
        action: () => setLastAction('Дублировать'),
      },
      {
        text: 'Переименовать',
        action: () => setLastAction('Переименовать'),
      },
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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined" size="m">
            Действия
          </Button>
        )}
      />
      {lastAction && <Text variant="body-1">Выбрано: {lastAction}</Text>}
    </div>
  );
}
