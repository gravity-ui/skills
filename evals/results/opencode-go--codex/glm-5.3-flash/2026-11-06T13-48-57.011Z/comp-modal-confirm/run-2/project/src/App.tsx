import React from 'react';
import { Button, Modal } from '@gravity-ui/uikit';

const styles = {
  page: { padding: 24 } as React.CSSProperties,
  content: { padding: 24, maxWidth: 420 } as React.CSSProperties,
  title: { margin: 0, fontSize: 20, fontWeight: 600 } as React.CSSProperties,
  text: { margin: '12px 0 24px' } as React.CSSProperties,
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 8 } as React.CSSProperties,
};

export function App() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const closeModal = React.useCallback(() => setIsModalOpen(false), []);

  return (
    <div style={styles.page}>
      <Button view="action" size="m" onClick={() => setIsModalOpen(true)}>
        Открыть подтверждение
      </Button>

      {isModalOpen && (
        <Modal open onClose={closeModal}>
          <div style={styles.content}>
            <h2 style={styles.title}>Подтвердите действие</h2>
            <p style={styles.text}>
              Это модальное окно подтверждения. Подтвердите действие или отмените его, если оно выполнено по ошибке.
            </p>
            <div style={styles.actions}>
              <Button view="flat-secondary" size="m" onClick={closeModal}>
                Отменить
              </Button>
              <Button view="action" size="m" onClick={closeModal}>
                Подтвердить
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
