import {useRef, useState} from 'react';
import {Button, Label, Modal, Text} from '@gravity-ui/uikit';
import './App.css';

const steps = [
  ['Откройте диалог', 'Нажмите на кнопку, чтобы начать.'],
  ['Сделайте выбор', 'Подтвердите действие или отмените его.'],
  ['Продолжайте работу', 'Решение всегда остаётся за вами.'],
];

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    setConfirmed(false);
    setOpen(true);
  }

  return (
    <div className="app">
      <header className="page-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <Text variant="subheader-3">Практика</Text>
        </div>
        <div className="header-caption">
          <span className="status-dot" />
          <Text variant="body-1" color="secondary">Маленькие взаимодействия. Большая разница.</Text>
        </div>
        <Label theme="normal" size="s">Демо</Label>
      </header>
      <main className="main">
        <section className="intro" aria-labelledby="page-title">
          <div className="eyebrow"><span /> ОСОЗНАННЫЕ ДЕЙСТВИЯ</div>
          <Text as="h1" id="page-title" variant="display-3" className="page-title">
            Сначала — подтверждение.<br />Потом — действие.
          </Text>
          <Text as="p" variant="body-3" color="secondary" className="intro-description">
            Небольшая пауза, чтобы убедиться в своём решении.<br className="desktop-break" />
            {' '}Всё просто: откройте диалог и выберите, как поступить.
          </Text>
        </section>
        <section className="demo-card" aria-labelledby="demo-title">
          <div className="demo-content">
            <Label theme="clear" size="xs" className="example-label">ПОПРОБУЙТЕ САМИ</Label>
            <Text as="h2" id="demo-title" variant="header-2" className="demo-title">Решение за вами</Text>
            <Text as="p" variant="body-2" color="secondary" className="demo-description">
              Одно нажатие откроет окно подтверждения.<br className="desktop-break" />
              {' '}Ничего не произойдёт без вашего согласия.
            </Text>
            <Button view="action" size="xl" onClick={openDialog} className="open-button">
              Открыть модальное окно <span aria-hidden="true" className="button-arrow">↗</span>
            </Button>
            <div className="result" role="status" aria-live="polite">
              {confirmed ? (
                <Text variant="body-1" className="success-message"><span aria-hidden="true">✓</span> Готово! Действие подтверждено.</Text>
              ) : (
                <Text variant="body-1" color="hint">Попробуйте — это всего лишь пример</Text>
              )}
            </div>
          </div>
          <div className="illustration" aria-hidden="true">
            <div className="orbit orbit-outer" /><div className="orbit orbit-inner" />
            <div className="floating-spark spark-one">+</div><div className="floating-spark spark-two">+</div>
            <div className="illustration-window window-back" />
            <div className="illustration-window window-front">
              <div className="window-bar"><i /><i /><i /></div>
              <div className="window-body">
                <div className="illustration-check"><span /></div>
                <div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-short" />
                <div className="illustration-actions"><i /><i /></div>
              </div>
            </div>
            <div className="floating-label"><span>✓</span> Всё под контролем</div>
          </div>
          <div className="card-note">
            <span className="note-symbol" aria-hidden="true">i</span>
            <Text variant="body-1" color="secondary">Вы можете отменить действие в любой момент до подтверждения.</Text>
            <span className="escape-hint"><kbd>Esc</kbd> закрыть окно</span>
          </div>
        </section>
        <section className="steps" aria-label="Как это работает">
          {steps.map(([title, description], index) => (
            <div className="step" key={title}>
              <span className="step-number">0{index + 1}</span>
              <div className="step-copy">
                <Text as="h3" variant="subheader-1">{title}</Text>
                <Text as="p" variant="body-1" color="secondary">{description}</Text>
              </div>
            </div>
          ))}
        </section>
      </main>
      <footer className="page-footer">
        <Text variant="body-1" color="hint">Продумано до нажатия.</Text>
        <div className="footer-credit"><span className="mini-mark" aria-hidden="true" /><Text variant="body-1" color="secondary">Сделано с Gravity UI</Text></div>
      </footer>
      <Modal open={open} onOpenChange={setOpen} initialFocus={cancelRef}
        aria-labelledby="confirmation-title" aria-describedby="confirmation-description" contentClassName="confirmation-modal">
        <div className="modal-body">
          <div className="dialog-symbol" aria-hidden="true">?</div>
          <Text as="h2" id="confirmation-title" variant="header-2">Подтвердить действие?</Text>
          <Text as="p" id="confirmation-description" variant="body-2" color="secondary">
            Вы собираетесь выполнить действие. Убедитесь, что хотите продолжить, и нажмите «Подтвердить».
          </Text>
          <Text as="p" variant="body-1" color="hint">Если передумали, просто нажмите «Отменить».</Text>
        </div>
        <div className="modal-actions">
          <Button ref={cancelRef} view="outlined" size="l" onClick={() => setOpen(false)}>Отменить</Button>
          <Button view="action" size="l" onClick={() => {setConfirmed(true); setOpen(false);}}>Подтвердить</Button>
        </div>
      </Modal>
    </div>
  );
}
