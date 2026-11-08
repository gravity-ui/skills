import { useState } from 'react';
import { Text } from '@gravity-ui/uikit';

import { ActionsButton, type ActionId } from './ActionsButton';

const ACTION_LABELS: Record<ActionId, string> = {
  edit: 'Редактировать',
  duplicate: 'Дублировать',
  rename: 'Переименовать',
  delete: 'Удалить',
};

export function App() {
  const [last, setLast] = useState<ActionId | null>(null);

  return (
    <div style={{ padding: 24 }}>
      <ActionsButton onAction={setLast} />
      {last && (
        <Text variant="body-1" style={{ display: 'block', marginTop: 16 }}>
          Выбрано: {ACTION_LABELS[last]}
        </Text>
      )}
    </div>
  );
}
