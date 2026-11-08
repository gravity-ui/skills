import { useState } from 'react';
import { Button, Flex, Text } from '@gravity-ui/uikit';

import { ConfirmDialog } from './ConfirmDialog';

type Result = 'confirmed' | 'cancelled' | null;

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result>(null);

  const handleConfirm = () => {
    setResult('confirmed');
    setOpen(false);
  };

  const handleCancel = () => {
    setResult('cancelled');
    setOpen(false);
  };

  return (
    <Flex direction="column" gap={3} alignItems="flex-start" style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)} qa="open-confirm-dialog">
        Удалить элемент
      </Button>

      {result === 'confirmed' && (
        <Text color="positive" qa="confirm-result">
          Действие подтверждено
        </Text>
      )}
      {result === 'cancelled' && (
        <Text color="secondary" qa="confirm-result">
          Действие отменено
        </Text>
      )}

      <ConfirmDialog
        open={open}
        title="Подтвердите действие"
        text="Вы действительно хотите удалить этот элемент? Это действие нельзя отменить."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Flex>
  );
}
