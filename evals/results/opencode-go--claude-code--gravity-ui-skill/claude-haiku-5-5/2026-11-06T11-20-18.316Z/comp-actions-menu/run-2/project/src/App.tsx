import * as React from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const createAction = (label: string): DropdownMenuItem => ({
    text: label,
    action: () => setLastAction(label),
  });

  const items: DropdownMenuItem[][] = [
    [createAction('Редактировать'), createAction('Дублировать'), createAction('Переместить')],
    [
      {
        text: 'Удалить',
        theme: 'danger',
        action: () => setLastAction('Удалить'),
      },
    ],
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(switcherProps) => (
          <Button view="outlined" {...switcherProps}>
            Действия
          </Button>
        )}
      />
      {lastAction !== null && (
        <Text variant="body-1">Выбрано действие: {lastAction}</Text>
      )}
    </div>
  );
}
