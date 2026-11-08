import {useState} from 'react';
import {Button, Modal} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setModalOpen(false);
  };

  const handleCancel = () => {
    setConfirmed(false);
    setModalOpen(false);
  };

  return (
    <main className="confirmation-page">
      <section className="confirmation-card" aria-labelledby="page-title">
        <span className="confirmation-card__eyebrow">ПОДТВЕРЖДЕНИЕ ДЕЙСТВИЯ</span>
        <h1 className="confirmation-card__title" id="page-title">
          Проверьте перед продолжением
        </h1>
        <p className="confirmation-card__description">
          Откройте окно подтверждения, чтобы принять решение.
        </p>
        <Button view="action" size="l" onClick={() => setModalOpen(true)}>
          Открыть окно
        </Button>
        {isConfirmed && (
          <p className="confirmation-card__result" role="status">
            Действие подтверждено.
          </p>
        )}
      </section>

      <Modal
        open={isModalOpen}
        onOpenChange={(open) => setModalOpen(open)}
        aria-labelledby="confirm-title"
      >
        <div className="confirmation-modal">
          <span className="confirmation-modal__eyebrow">ТРЕБУЕТСЯ ВАШЕ РЕШЕНИЕ</span>
          <h2 className="confirmation-modal__title" id="confirm-title">
            Подтвердить действие?
          </h2>
          <p className="confirmation-modal__description">
            Вы уверены, что хотите продолжить? Это действие можно подтвердить сейчас или
            отменить.
          </p>
          <div className="confirmation-modal__actions">
            <Button view="normal" size="l" onClick={handleCancel}>
              Отменить
            </Button>
            <Button view="action" size="l" onClick={handleConfirm}>
              Подтвердить
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
