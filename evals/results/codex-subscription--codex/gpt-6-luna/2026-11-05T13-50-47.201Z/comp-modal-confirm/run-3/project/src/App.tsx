import { useState } from 'react';
import { Button, Modal, Text } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const confirm = () => {
    setMessage('Действие подтверждено');
    setIsOpen(false);
  };

  const cancel = () => {
    setMessage('');
    setIsOpen(false);
  };

  return (
    <main className="page">
      <section className="demo-card" aria-labelledby="page-title">
        <div className="demo-card__eyebrow">ПОДТВЕРЖДЕНИЕ ДЕЙСТВИЯ</div>
        <Text variant="display-2" as="h1" id="page-title" className="demo-card__title">
          Всё готово?
        </Text>
        <Text variant="body-2" color="secondary" className="demo-card__description">
          Откройте окно, чтобы подтвердить действие или вернуться назад.
        </Text>
        <Button view="action" size="l" onClick={() => setIsOpen(true)}>
          Открыть окно
        </Button>
        {message && <div className="demo-card__result" role="status">{message}</div>}
      </section>

      <Modal open={isOpen} onClose={cancel} aria-labelledby="confirm-title">
        <div className="confirm-modal">
          <div className="confirm-modal__icon" aria-hidden="true">?</div>
          <Text variant="header-2" as="h2" id="confirm-title" className="confirm-modal__title">
            Подтвердите действие
          </Text>
          <Text variant="body-2" color="secondary" className="confirm-modal__text">
            Вы уверены, что хотите продолжить? Это действие можно подтвердить или отменить.
          </Text>
          <div className="confirm-modal__actions">
            <Button view="normal" size="l" onClick={cancel}>Отменить</Button>
            <Button view="action" size="l" onClick={confirm}>Подтвердить</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
