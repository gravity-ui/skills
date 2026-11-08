// Implement the requested feature here (and may add sibling files).
import React from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';

const actions = [
  {
    id: 'duplicate',
    text: 'Дублировать',
  },
  {
    id: 'rename',
    text: 'Переименовать',
  },
  {
    id: 'delete',
    text: 'Удалить',
  },
] as const;

export function App() {
  const [selectedAction, setSelectedAction] = React.useState<string>();

  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        size="m"
        items={actions.map((action) => ({
          action: () => setSelectedAction(action.text),
          text: action.text,
        }))}
        renderSwitcher={(props) => (
          <Button {...props} size="m" view="action">
            Действия
          </Button>
        )}
      />

      {selectedAction ? (
        <div style={{ marginTop: 12 }}>
          <Text variant="body-1">Выбрано действие: {selectedAction}</Text>
        </div>
      ) : null}
    </div>
  );
}
