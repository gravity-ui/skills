import { useState } from 'react';
import { Button, DropdownMenu } from '@gravity-ui/uikit';

const actions = [
  { label: 'Редактировать' },
  { label: 'Дублировать' },
  [{ label: 'Удалить' }],
];

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div style={{ display: 'grid', gap: 12, padding: 24 }}>
      <DropdownMenu
        items={actions.map((item) =>
          Array.isArray(item)
            ? item.map((actionItem) => ({
                ...actionItem,
                action: () => setLastAction(actionItem.label),
              }))
            : {
                ...item,
                action: () => setLastAction(item.label),
              },
        )}
        renderSwitcher={(props) => (
          <Button {...props} view="outlined">
            Действия
          </Button>
        )}
      />
      {lastAction && <span>Выполнено: {lastAction}</span>}
    </div>
  );
}
