import { useState } from 'react';
import { Button, Modal } from '@gravity-ui/uikit';

export function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setOpen(true)}>
        Открыть
      </Button>

      <Modal open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
        <div style={{ padding: '24px', maxWidth: '400px' }}>
          <h2 style={{ margin: '0 0 16px' }}>Подтверждение</h2>
          <p style={{ margin: '0 0 24px', lineHeight: 1.5 }}>
            Вы уверены, что хотите выполнить это действие? Пожалуйста, подтвердите или отмените.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              view="normal"
              size="l"
              onClick={() => {
                setOpen(false);
              }}
            >
              Отменить
            </Button>
            <Button view="action" size="l" onClick={() => setOpen(false)}>
              Подтвердить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
