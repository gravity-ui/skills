import {useId, useState} from 'react';
import {Button, Modal} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState('');
  const titleId = useId();
  const descriptionId = useId();

  function closeModal(confirmed: boolean) {
    setIsOpen(false);
    setResult(confirmed ? 'Действие подтверждено.' : 'Действие отменено.');
  }

  return (
    <main className="page">
      <Button
        view="action"
        size="l"
        aria-haspopup="dialog"
        onClick={() => {
          setResult('');
          setIsOpen(true);
        }}
      >
        Открыть модальное окно
      </Button>
      <p className="result" role="status">{result}</p>

      <Modal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeModal(false);
        }}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        contentClassName="confirmation-modal"
      >
        <h2 id={titleId} className="modal-title">Подтверждение действия</h2>
        <p id={descriptionId} className="modal-description">
          Вы уверены, что хотите продолжить? Нажмите «Подтвердить»,
          чтобы выполнить действие, или «Отменить», чтобы вернуться.
        </p>
        <div className="modal-actions">
          <Button size="l" view="normal" onClick={() => closeModal(false)}>
            Отменить
          </Button>
          <Button size="l" view="action" onClick={() => closeModal(true)}>
            Подтвердить
          </Button>
        </div>
      </Modal>
    </main>
  );
}
