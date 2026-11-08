import React from 'react';
import { ArrowToggle, Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = React.useState(false);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

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
        text: 'Переместить',
        action: () => setLastAction('Переместить'),
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
        open={open}
        onOpenToggle={setOpen}
        renderSwitcher={(switcherProps) => (
          <Button {...switcherProps} view="outlined" size="l">
            Действия
            <ArrowToggle direction={open ? 'top' : 'bottom'} />
          </Button>
        )}
      />
      {lastAction && <Text>Выбрано: {lastAction}</Text>}
    </div>
  );
}
