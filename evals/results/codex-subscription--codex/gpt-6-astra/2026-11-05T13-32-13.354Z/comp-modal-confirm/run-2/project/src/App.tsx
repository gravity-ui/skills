import { useId, useRef, useState } from 'react';
import { Button, Modal } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const titleId = useId();
  const descriptionId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function closeModal(confirmed: boolean) {
    setOpen(false);
    setMessage(confirmed ? 'Действие подтверждено.' : 'Действие отменено.');
  }

  return (
    <main className="app">
      <Button
        ref={triggerRef}
        view="action"
        size="l"
        aria-haspopup="dialog"
        onClick={() => {
          setMessage('');
          setOpen(true);
        }}
      >
        Открыть модальное окно
      </Button>
      <p className="action-status" role="status">{message}</p>

      <Modal
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeModal(false);
        }}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        initialFocus={cancelRef}
        returnFocus={triggerRef}
        contentClassName="confirmation-modal"
      >
        <h2 id={titleId} className="modal-title">Подтверждение действия</h2>
        <p id={descriptionId} className="modal-description">
          Вы уверены, что хотите выполнить это действие?
          Нажмите «Подтвердить», чтобы продолжить, или «Отменить», чтобы закрыть окно.
        </p>
        <div className="modal-actions">
          <Button ref={cancelRef} size="l" onClick={() => closeModal(false)}>
            Отменить
          </Button>
          <Button view="action" size="l" onClick={() => closeModal(true)}>
            Подтвердить
          </Button>
        </div>
      </Modal>
    </main>
  );
}
