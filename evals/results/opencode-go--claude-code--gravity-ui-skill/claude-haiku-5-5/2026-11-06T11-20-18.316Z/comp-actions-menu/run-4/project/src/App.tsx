import { useState } from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items: DropdownMenuItem<void>[][] = [
    [
      { text: 'Редактировать', action: () => setLastAction('Редактировать') },
      { text: 'Дублировать', action: () => setLastAction('Дублировать') },
      { text: 'Переименовать', action: () => setLastAction('Переименовать') },
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
    <div style={{ padding: 24 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(switcherProps) => (
          <Button view="outlined" {...switcherProps}>
            Действия
          </Button>
        )}
      />
      {lastAction && (
        <div style={{ marginTop: 16 }}>
          <Text variant="body-1">Выбрано: {lastAction}</Text>
        </div>
      )}
    </div>
  );
}
