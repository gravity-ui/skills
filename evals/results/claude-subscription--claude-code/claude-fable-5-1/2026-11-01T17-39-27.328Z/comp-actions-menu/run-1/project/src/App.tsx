import { useState } from 'react';
import { Text } from '@gravity-ui/uikit';

import { ActionsMenu } from './ActionsMenu';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items = [
    [
      { text: 'Переименовать', action: () => setLastAction('Переименовать') },
      { text: 'Дублировать', action: () => setLastAction('Дублировать') },
      { text: 'Поделиться', action: () => setLastAction('Поделиться') },
    ],
    [
      {
        text: 'Удалить',
        theme: 'danger' as const,
        action: () => setLastAction('Удалить'),
      },
    ],
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ActionsMenu label="Действия" items={items} />
      <Text color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Действие пока не выбрано'}
      </Text>
    </div>
  );
}
