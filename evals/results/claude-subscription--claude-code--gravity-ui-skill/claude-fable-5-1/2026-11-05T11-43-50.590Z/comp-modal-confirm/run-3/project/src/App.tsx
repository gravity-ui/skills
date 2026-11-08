import React from 'react';
import { Flex, Text } from '@gravity-ui/uikit';

import { ConfirmDialogButton } from './ConfirmDialogButton';

export function App() {
  const [status, setStatus] = React.useState<string | null>(null);

  return (
    <Flex direction="column" gap="4" style={{ padding: 24 }}>
      <ConfirmDialogButton
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
