import React from 'react';
import { Button, DropdownMenu } from '@gravity-ui/uikit';
import { Copy, Ellipsis, Link, Pencil, TrashBin } from '@gravity-ui/icons';

export function App() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const items = [
    {
      text: 'Редактировать',
      iconStart: <Pencil width={16} height={16} />,
      action: () => setLastAction('Редактировать'),
    },
    {
      text: 'Дублировать',
      iconStart: <Copy width={16} height={16} />,
      action: () => setLastAction('Дублировать'),
    },
    {
      text: 'Поделиться',
      iconStart: <Link width={16} height={16} />,
      action: () => setLastAction('Поделиться'),
    },
    [
      {
        text: 'Удалить',
        iconStart: <TrashBin width={16} height={16} />,
        theme: 'danger' as const,
        action: () => setLastAction('Удалить'),
      },
    ],
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <DropdownMenu
        items={items}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined" size="l">
            Действия
            <Ellipsis width={16} height={16} />
          </Button>
        )}
      />
      {lastAction && <div>Выбрано действие: {lastAction}</div>}
    </div>
  );
}
