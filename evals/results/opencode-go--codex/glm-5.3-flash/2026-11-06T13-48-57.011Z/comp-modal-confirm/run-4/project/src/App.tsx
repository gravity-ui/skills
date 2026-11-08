import React from 'react';
import { Button, Modal } from '@gravity-ui/uikit';

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ open, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <div style={{ padding: 24 }}>
        <h2>Подтверждение действия</h2>
        <p>Вы уверены, что хотите подтвердить это действие?</p>
        <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button view="flat" onClick={onCancel}>
            Отменить
          </Button>
          <Button view="action" onClick={onConfirm}>
            Подтвердить
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function App() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setModalOpen(false);
  };

  const handleCancel = () => setModalOpen(false);

  return (
    <div style={{ padding: 24 }}>
      <Button view="action" size="l" onClick={() => setModalOpen(true)}>
        Открыть диалог
      </Button>
      {confirmed && <p style={{ marginTop: 16 }}>Действие подтверждено.</p>}
      <ConfirmModal open={modalOpen} onConfirm={handleConfirm} onCancel={handleCancel} />
    </div>
  );
}
