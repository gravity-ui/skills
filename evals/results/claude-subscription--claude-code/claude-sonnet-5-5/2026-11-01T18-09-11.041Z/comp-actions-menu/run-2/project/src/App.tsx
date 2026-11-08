import { useState } from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items: DropdownMenuItem[][] = [
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
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <DropdownMenu
        items={items}
        popupProps={{ placement: 'bottom-start' }}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия ▾
          </Button>
        )}
      />
      <Text color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Действие не выбрано'}
      </Text>
    </div>
  );
}
