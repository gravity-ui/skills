import { useState } from 'react';
import { Flex, Text } from '@gravity-ui/uikit';

import { ActionsMenu, type ActionId } from './ActionsMenu';

const ACTION_LABELS: Record<ActionId, string> = {
  edit: 'Редактировать',
  duplicate: 'Дублировать',
  'copy-link': 'Скопировать ссылку',
  download: 'Скачать',
  delete: 'Удалить',
};

export function App() {
  const [lastAction, setLastAction] = useState<ActionId | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Flex gap={3} alignItems="center">
        <ActionsMenu onAction={setLastAction} />
        <Text variant="body-1" color="secondary">
          {lastAction ? `Выбрано: ${ACTION_LABELS[lastAction]}` : 'Нажмите кнопку, чтобы открыть список действий'}
        </Text>
      </Flex>
    </Flex>
  );
}
