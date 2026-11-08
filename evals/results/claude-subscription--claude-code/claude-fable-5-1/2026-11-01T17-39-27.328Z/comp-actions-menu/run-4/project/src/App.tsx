import { useState } from 'react';
import { Text } from '@gravity-ui/uikit';

import { ActionsMenu, type ActionId } from './ActionsMenu';

const ACTION_LABELS: Record<ActionId, string> = {
  edit: 'Редактировать',
  duplicate: 'Дублировать',
  share: 'Поделиться',
  archive: 'Архивировать',
  delete: 'Удалить',
};

export function App() {
  const [last, setLast] = useState<ActionId | null>(null);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ActionsMenu onAction={setLast} />
      <Text color="secondary">
        {last ? `Выбрано действие: ${ACTION_LABELS[last]}` : 'Нажмите кнопку, чтобы открыть список действий'}
      </Text>
    </div>
  );
}
