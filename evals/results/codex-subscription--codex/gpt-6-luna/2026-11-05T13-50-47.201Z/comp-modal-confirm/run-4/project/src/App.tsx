import { useState } from 'react';
import { Button, Modal } from '@gravity-ui/uikit';

export function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    setIsModalOpen(false);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        boxSizing: 'border-box',
        background: 'var(--g-color-base-background, #f5f5f5)',
      }}
    >
      <section style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div
          aria-hidden="true"
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 20px',
            display: 'grid',
            placeItems: 'center',
            borderRadius: 18,
            background: 'var(--g-color-base-brand, #ffbe5c)',
            color: 'var(--g-color-text-primary, #1c1c1c)',
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          ?
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 28, lineHeight: 1.2 }}>
          Подтверждение действия
        </h1>
        <p style={{ margin: '0 0 24px', color: 'var(--g-color-text-secondary, #777)' }}>
          Нажмите кнопку, чтобы открыть окно подтверждения.
        </p>
        <Button view="action" size="l" onClick={() => setIsModalOpen(true)}>
          Открыть окно
        </Button>
        {isConfirmed && (
          <p role="status" style={{ margin: '16px 0 0', color: 'var(--g-color-text-positive, #16804a)' }}>
            Действие подтверждено
          </p>
        )}
      </section>

      <Modal
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
        aria-labelledby="confirmation-title"
        contentClassName="confirmation-modal"
      >
        <div style={{ width: 'min(100%, 400px)', padding: 32, boxSizing: 'border-box' }}>
          <div
            aria-hidden="true"
            style={{
              width: 44,
              height: 44,
              marginBottom: 20,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 14,
              background: 'var(--g-color-base-warning-light, #fff2d9)',
              color: 'var(--g-color-text-warning, #9b5b00)',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            !
          </div>
          <h2 id="confirmation-title" style={{ margin: '0 0 10px', fontSize: 22, lineHeight: 1.3 }}>
            Подтвердите действие
          </h2>
          <p style={{ margin: '0 0 28px', color: 'var(--g-color-text-secondary, #777)', lineHeight: 1.5 }}>
            Вы уверены, что хотите продолжить?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button view="outlined" size="l" onClick={() => setIsModalOpen(false)}>
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
