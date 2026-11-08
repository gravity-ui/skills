import {useRef, useState} from 'react';
import {Button, Modal} from '@gravity-ui/uikit';
import './App.css';

function DialogIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M7 5.5h14a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-8l-5.5 4v-4H7a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 11h10M9 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="./" aria-label="Диалог — главная">
          <span className="brand-mark"><DialogIcon /></span>
          диалог<span className="brand-dot">.</span>
        </a>
        <span className="header-note"><span />Простые взаимодействия</span>
      </header>

      <main className="main">
        <div className="intro">
          <span className="eyebrow">ВЫ РЕШАЕТЕ</span>
          <h1>Один клик.<br />Осознанное действие.</h1>
          <p>Иногда перед следующим шагом<br className="desktop-break" /> стоит на секунду остановиться.</p>
        </div>

        <section className="action-card" aria-labelledby="card-title">
          <div className="icon-tile"><DialogIcon /></div>
          <h2 id="card-title">Подтверждение действия</h2>
          <p>Нажмите на кнопку, чтобы открыть окно<br className="desktop-break" /> и подтвердить или отменить действие.</p>
          <Button view="action" size="xl" className="primary-button" onClick={() => {setConfirmed(false); setOpen(true);}}>
            Открыть окно <span className="button-arrow" aria-hidden="true">↗</span>
          </Button>
          <div className="card-note"><span aria-hidden="true">↳</span> Последнее слово всегда за вами</div>
        </section>
        <div className={`result ${confirmed ? 'result-visible' : ''}`} role="status">
          {confirmed && <><span aria-hidden="true">✓</span> Действие подтверждено</>}
        </div>
      </main>

      <footer className="footer"><span>Просто. Понятно. Под контролем.</span><span>Сделано для людей</span></footer>

      <Modal open={open} onOpenChange={setOpen} initialFocus={cancelRef} aria-labelledby="modal-title" aria-describedby="modal-description" contentClassName="confirm-modal">
        <div className="icon-tile"><DialogIcon /></div>
        <h2 id="modal-title">Подтвердить действие?</h2>
        <p id="modal-description">Вы уверены, что хотите продолжить? Нажмите «Подтвердить», чтобы выполнить действие, или «Отменить», чтобы вернуться.</p>
        <div className="modal-actions">
          <Button ref={cancelRef} view="outlined" size="l" onClick={() => setOpen(false)}>Отменить</Button>
          <Button view="action" size="l" className="primary-button" onClick={() => {setConfirmed(true); setOpen(false);}}>Подтвердить</Button>
        </div>
      </Modal>
    </div>
  );
}
