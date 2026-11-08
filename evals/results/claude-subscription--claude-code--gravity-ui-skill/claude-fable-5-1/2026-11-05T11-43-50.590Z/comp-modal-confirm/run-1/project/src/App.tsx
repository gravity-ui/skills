import React from 'react';
import { Flex, Text } from '@gravity-ui/uikit';

import { ConfirmModal } from './ConfirmModal';

export function App() {
  const [status, setStatus] = React.useState<string | null>(null);

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <ConfirmModal
        triggerText="Удалить проект"
        title="Удалить проект?"
        message="Проект и все связанные с ним данные будут удалены без возможности восстановления. Вы уверены, что хотите продолжить?"
        textButtonApply="Подтвердить"
        textButtonCancel="Отменить"
        onConfirm={() => setStatus('Действие подтверждено')}
        onCancel={() => setStatus('Действие отменено')}
      />
      {status && (
        <Text variant="body-1" color="secondary">
          {status}
        </Text>
      )}
    </Flex>
  );
}
