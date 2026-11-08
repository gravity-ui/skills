import * as React from 'react';
import { Text } from '@gravity-ui/uikit';

import { ActionsMenu, type ActionsMenuItem } from './ActionsMenu';

export function App() {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const items: (ActionsMenuItem | ActionsMenuItem[])[] = [
    [
      { text: 'Редактировать', action: () => setLastAction('Редактировать') },
      { text: 'Дублировать', action: () => setLastAction('Дублировать') },
      { text: 'Поделиться', action: () => setLastAction('Поделиться') },
    ],
    [{ text: 'Архивировать', action: () => setLastAction('Архивировать') }],
    [{ text: 'Удалить', theme: 'danger', action: () => setLastAction('Удалить') }],
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ActionsMenu label="Действия" items={items} />
      <Text color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Откройте меню и выберите действие'}
      </Text>
    </div>
  );
}
