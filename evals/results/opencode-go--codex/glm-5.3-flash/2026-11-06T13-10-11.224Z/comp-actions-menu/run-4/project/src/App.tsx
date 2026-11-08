import { useState } from 'react';

import { ArrowToggle, Button, DropdownMenu } from '@gravity-ui/uikit';

const actions = [
  { id: 'duplicate', text: 'Дублировать' },
  { id: 'rename', text: 'Переименовать' },
  { id: 'share', text: 'Поделиться' },
  { id: 'delete', text: 'Удалить', theme: 'danger' as const },
];

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items = actions.map(({ id, text, theme }) => ({
    id,
    text,
    theme,
    action: () => setLastAction(text),
  }));

  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start', padding: 24 }}>
      <DropdownMenu
        items={[items]}
        renderSwitcher={(props) => (
          <Button {...props} view="normal">
            Действия
            <ArrowToggle direction="bottom" />
          </Button>
        )}
        size="m"
      />

      {lastAction && <div>Последнее действие: {lastAction}</div>}
    </div>
  );
}
