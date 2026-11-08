import { useRef, useState } from 'react';
import { Button, Modal } from '@gravity-ui/uikit';
import './App.css';

function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function DialogIllustration() {
  return (
    <div className="illustration" aria-hidden="true">
      <div className="illustration-orbit" />
      <div className="mini-dialog">
        <div className="mini-check"><CheckIcon /></div>
        <div className="mini-line long" /><div className="mini-line short" />
        <div className="mini-actions"><span /><span /></div>
      </div>
      <svg className="cursor" width="32" height="38" viewBox="0 0 32 38" fill="none"><path d="m5 3 22 18-11 2-5 10L5 3Z" fill="#2864E8" stroke="white" strokeWidth="2.5" strokeLinejoin="round" /></svg>
      <span className="spark spark-one" /><span className="spark spark-two" />
    </div>
  );
}

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function openDialog() {
    setConfirmed(false);
    setOpen(true);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Диалог — главная">
          <span className="brand-mark"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-8l-5.5 3v-3H5A1.5 1.5 0 0 1 3.5 16V6A1.5 1.5 0 0 1 5 4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></span>
          диалог<span className="brand-period">.</span>
        </a>
        <span className="header-note">Простые действия. Понятные решения.</span>
      </header>
      <main>
        <div className="intro">
          <span className="eyebrow"><span /> МОМЕНТ ДЛЯ РЕШЕНИЯ</span>
          <h1>Сначала — подтверждение.</h1>
          <p>Иногда достаточно небольшой паузы,<br className="desktop-break" /> чтобы сделать следующий шаг уверенно.</p>
        </div>
        <section className="demo-card" aria-labelledby="card-title">
          <span className="card-label">ПОПРОБУЙТЕ В ДЕЙСТВИИ</span>
          <DialogIllustration />
          <h2 id="card-title">Всё под вашим контролем</h2>
          <p className="card-description">Откройте диалог, прочитайте сообщение<br className="desktop-break" /> и выберите, как действовать дальше.</p>
          <Button className="primary-button launch-button" view="action" size="xl" onClick={openDialog}>
            Открыть диалог
            <Button.Icon side="end"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Button.Icon>
          </Button>
          <div className="card-bottom"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5.5" y="10" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> Ничего не произойдёт без вашего согласия</div>
        </section>
        <ol className="steps" aria-label="Как это работает">
          <li><span className="step-number">1</span><div><strong>Откройте</strong><span>Одним нажатием</span></div></li>
          <li><span className="step-number">2</span><div><strong>Выберите</strong><span>Подтвердить или отменить</span></div></li>
          <li><span className="step-number">3</span><div><strong>Продолжайте</strong><span>Решение за вами</span></div></li>
        </ol>
        <div className={`result-message ${confirmed ? 'is-visible' : ''}`} role="status" aria-live="polite">
          {confirmed && <><CheckIcon /><span>Действие успешно подтверждено</span><button className="dismiss-result" onClick={() => setConfirmed(false)} aria-label="Закрыть уведомление">×</button></>}
        </div>
      </main>
      <footer className="site-footer"><span>Немного внимания к каждому действию.</span><span className="footer-detail"><span /> Сделано с заботой о вас</span></footer>
      <Modal open={open} onOpenChange={setOpen} initialFocus={cancelRef} aria-labelledby="dialog-title" aria-describedby="dialog-description" contentClassName="confirmation-dialog">
        <div className="modal-body">
          <div className="modal-icon"><CheckIcon /></div>
          <span className="modal-eyebrow">ЕЩЁ ОДИН ШАГ</span>
          <h2 id="dialog-title">Подтвердить действие?</h2>
          <p id="dialog-description">Вы уверены, что хотите продолжить? Нажмите «Подтвердить», чтобы выполнить действие, или «Отменить», чтобы вернуться назад.</p>
          <div className="modal-actions">
            <Button ref={cancelRef} view="outlined" size="xl" onClick={() => setOpen(false)}>Отменить</Button>
            <Button className="primary-button" view="action" size="xl" onClick={() => { setOpen(false); setConfirmed(true); }}>Подтвердить</Button>
          </div>
        </div>
        <div className="modal-hint">Можно вернуться назад в любой момент <kbd>Esc</kbd></div>
      </Modal>
    </div>
  );
}
