import { useState } from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';
import type { DropdownMenuItem } from '@gravity-ui/uikit';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Пункты меню сгруппированы: вложенные массивы отображаются как отдельные группы.
  const items: DropdownMenuItem[][] = [
    [
      { text: 'Редактировать', action: () => setLastAction('Редактировать') },
      { text: 'Дублировать', action: () => setLastAction('Дублировать') },
      { text: 'Переименовать', action: () => setLastAction('Переименовать') },
    ],
    [
      { text: 'Удалить', theme: 'danger', action: () => setLastAction('Удалить') },
    ],
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <DropdownMenu
        items={items}
        renderSwitcher={({ onClick, onKeyDown }) => (
          <Button view="outlined" onClick={onClick} onKeyDown={onKeyDown}>
            Действия
          </Button>
        )}
      />
      {lastAction && <Text>Выбрано действие: {lastAction}</Text>}
    </div>
  );
}
