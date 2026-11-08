import { useState } from 'react';
import { Button, DropdownMenu, Text } from '@gravity-ui/uikit';

type ActionId = 'edit' | 'duplicate' | 'share' | 'delete';

const ACTION_LABELS: Record<ActionId, string> = {
  edit: 'Редактировать',
  duplicate: 'Дублировать',
  share: 'Поделиться',
  delete: 'Удалить',
};

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const runAction = (id: ActionId) => {
    setLastAction(ACTION_LABELS[id]);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <DropdownMenu
        size="l"
        items={[
          [
            { text: ACTION_LABELS.edit, action: () => runAction('edit') },
            { text: ACTION_LABELS.duplicate, action: () => runAction('duplicate') },
          ],
          [
            { text: ACTION_LABELS.share, action: () => runAction('share') },
            { text: ACTION_LABELS.delete, action: () => runAction('delete') },
          ],
        ]}
        renderSwitcher={(switcherProps) => (
          <Button {...switcherProps} view="outlined" size="l">
            Действия
          </Button>
        )}
      />
      {lastAction && <Text>Выбрано: {lastAction}</Text>}
    </div>
  );
}
