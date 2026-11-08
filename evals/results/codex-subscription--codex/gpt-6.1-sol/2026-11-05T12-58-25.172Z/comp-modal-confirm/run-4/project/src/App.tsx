import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from '@gravity-ui/uikit';
import './App.css';

function ArrowIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function DialogIcon({ small = false }: { small?: boolean }) {
  return <svg width={small ? 21 : 28} height={small ? 21 : 28} viewBox="0 0 28 28" fill="none" aria-hidden="true"><rect x="4.5" y="5.5" width="19" height="17" rx="4" stroke="currentColor" strokeWidth="1.7" /><path d="M5 11h18" stroke="currentColor" strokeWidth="1.7" /><path d="M9 16h5m-5 3h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="8.5" cy="8.3" r=".8" fill="currentColor" /><circle cx="11.5" cy="8.3" r=".8" fill="currentColor" /></svg>;
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!confirmed) return;
    const timer = window.setTimeout(() => setConfirmed(false), 5000);
    return () => window.clearTimeout(timer);
  }, [confirmed]);

  function confirm() {
    setOpen(false);
    setConfirmed(true);
  }

  return (
    <div className="app-shell">
      <header className="page-header">
        <div className="brand"><span className="brand-mark"><DialogIcon small /></span>диалог<span className="brand-dot">.</span></div>
        <span className="header-caption">Простые действия. Ясные решения.</span>
      </header>

      <main className="main">
        <div className="intro">
          <span className="eyebrow"><span />МАЛЕНЬКОЕ ДЕЙСТВИЕ — ВАЖНЫЙ ВЫБОР</span>
          <h1>Решение за вами.</h1>
          <p className="intro-description">Иногда достаточно одного клика.<br />А перед следующим — немного уверенности.</p>
        </div>

        <section className="action-card" aria-labelledby="card-title">
          <div className="card-heading">
            <span className="icon-tile"><DialogIcon /></span>
            <span className="demo-label"><span />Интерактивный пример</span>
          </div>
          <h2 id="card-title">Сначала — подтверждение</h2>
          <p className="card-description">Откройте модальное окно, прочитайте сообщение<br className="desktop-break" /> и выберите, как действовать дальше.</p>
          <Button view="action" size="xl" className="primary-button open-button" onClick={() => { setConfirmed(false); setOpen(true); }}>
            <span className="button-content">Открыть модальное окно<ArrowIcon /></span>
          </Button>
          <div className="card-footer"><span className="hint-dot" />Вы всегда можете передумать<span className="keyboard-hint"><kbd>esc</kbd> чтобы закрыть</span></div>
        </section>

        <div className="under-card"><svg width="15" height="17" viewBox="0 0 18 20" fill="none" aria-hidden="true"><path d="M9 2 3 4.5V10c0 3.5 6 7 6 7s6-3.5 6-7V4.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><path d="m6.5 9 1.7 1.7 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>Ничего не произойдёт без вашего подтверждения</div>
      </main>

      <footer className="page-footer"><span>Продумано до последнего клика.</span><span className="footer-detail"><span />Всё под вашим контролем</span></footer>

      <Modal open={open} onOpenChange={setOpen} initialFocus={cancelRef} aria-labelledby="confirmation-title" aria-describedby="confirmation-description" contentClassName="confirmation-modal">
        <div className="modal-content">
          <button className="icon-button modal-close" onClick={() => setOpen(false)} aria-label="Закрыть окно"><CloseIcon /></button>
          <span className="icon-tile modal-icon"><DialogIcon /></span>
          <span className="modal-eyebrow">ЕЩЁ ОДИН ШАГ</span>
          <h2 id="confirmation-title">Подтвердить действие?</h2>
          <p id="confirmation-description">Вы уверены, что хотите продолжить? Подтвердите действие или нажмите «Отменить», чтобы вернуться на страницу.</p>
          <div className="modal-actions">
            <Button ref={cancelRef} size="xl" view="outlined" className="cancel-button" onClick={() => setOpen(false)}>Отменить</Button>
            <Button size="xl" view="action" className="primary-button confirm-button" onClick={confirm}>Подтвердить<svg className="confirm-check" width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Button>
          </div>
        </div>
      </Modal>

      {confirmed && <div className="success-toast" role="status"><span className="toast-check">✓</span><span>Действие подтверждено</span><button className="icon-button" aria-label="Закрыть уведомление" onClick={() => setConfirmed(false)}><CloseIcon /></button></div>}
    </div>
  );
}
