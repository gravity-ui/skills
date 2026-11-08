import { useEffect, useRef, useState } from 'react';
import { Button } from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState('');
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    cancelButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const cancel = () => {
    setIsOpen(false);
    setResult('Действие отменено.');
  };

  const confirm = () => {
    setIsOpen(false);
    setResult('Действие подтверждено.');
  };

  return (
    <main className="page">
      <section className="card" aria-labelledby="page-title">
        <div className="card__icon" aria-hidden="true">?</div>
        <p className="eyebrow">Подтверждение действия</p>
        <h1 id="page-title">Нужно ваше решение</h1>
        <p className="intro">Откройте окно, чтобы проверить, как работают подтверждение и отмена.</p>
        <Button view="action" size="l" onClick={() => { setResult(''); setIsOpen(true); }}>
          Открыть окно
        </Button>
        {result && <p className="result" role="status">{result}</p>}
      </section>

      {isOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}>
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
          >
            <div className="dialog__icon" aria-hidden="true">!</div>
            <h2 id="dialog-title">Подтвердите действие</h2>
            <p id="dialog-description">Вы уверены, что хотите продолжить? Это действие нельзя будет отменить.</p>
            <div className="dialog__actions">
              <Button ref={cancelButtonRef} view="flat" size="l" onClick={cancel}>
                Отменить
              </Button>
              <Button view="action" size="l" onClick={confirm}>
                Подтвердить
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
