import {useRef, useState} from 'react';
import {Button, Modal} from '@gravity-ui/uikit';
import './styles.css';

function ActionIcon({check = false}: {check?: boolean}) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {check ? <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : <>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </>}
  </svg>;
}

export function App() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<'confirmed' | 'cancelled' | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  function finish(confirmed: boolean) {
    setOpen(false);
    setResult(confirmed ? 'confirmed' : 'cancelled');
  }

  return <div className="app-shell">
    <header className="site-header">
      <a className="wordmark" href="./" aria-label="Форма — главная">
        <span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span>
        форма<span className="brand-period">.</span>
      </a>
      <span className="header-caption">Маленькие детали. Большой комфорт.</span>
      <span className="library-label"><span /> Простые взаимодействия</span>
    </header>

    <main className="main-content">
      <div className="breadcrumb"><span>Компоненты</span><span className="breadcrumb-slash">/</span><span>Диалог подтверждения</span></div>
      <section className="intro" aria-labelledby="page-title">
        <div className="eyebrow">ПАУЗА ПЕРЕД ВАЖНЫМ</div>
        <h1 id="page-title">Уверенность в каждом действии<span>.</span></h1>
        <p>Иногда достаточно одного вопроса, чтобы всё сделать правильно.<br className="desktop-break" /> Простой диалог, который оставляет решение за вами.</p>
      </section>

      <section className="demo" aria-label="Пример диалога подтверждения">
        <div className="demo-toolbar">
          <span className="demo-title"><span className="small-window" aria-hidden="true" />Интерактивный пример</span>
          <span className="live-label"><span /> Можно попробовать</span>
        </div>
        <div className="demo-canvas">
          <span className="canvas-corner corner-top" aria-hidden="true">+</span>
          <span className="canvas-corner corner-bottom" aria-hidden="true">+</span>
          <div className="action-card">
            <div className={`action-icon ${result === 'confirmed' ? 'success-icon' : ''}`}><ActionIcon check={result === 'confirmed'} /></div>
            <span className="card-eyebrow">ВАШЕ РЕШЕНИЕ ИМЕЕТ ЗНАЧЕНИЕ</span>
            <h2>{result === 'confirmed' ? 'Готово. Вы подтвердили.' : 'Всё под вашим контролем'}</h2>
            <p>{result === 'confirmed' ? 'Действие успешно выполнено. Вы можете попробовать ещё раз.' : 'Откройте диалог, чтобы подтвердить действие или вернуться назад.'}</p>
            <Button view="action" size="xl" className="primary-button launch-button" onClick={() => setOpen(true)}>
              Открыть диалог <span className="button-arrow" aria-hidden="true">↗</span>
            </Button>
            <div className={`card-note ${result ? 'has-result' : ''}`} role="status" aria-live="polite">
              {result === 'confirmed' ? <><span className="result-dot" /> Действие подтверждено</> : result === 'cancelled' ? 'Действие отменено. Вы можете попробовать снова.' : <><svg width="13" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3.5" y="7" width="9" height="7" rx="2" stroke="currentColor" /><path d="M5.5 7V4.5a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" /></svg> Решение всегда за вами</>}
            </div>
          </div>
          <span className="canvas-caption">Одно действие — осознанный выбор</span>
        </div>
        <div className="demo-footer"><span className="info-icon" aria-hidden="true">i</span> Это пример взаимодействия. Попробуйте любой вариант — всё безопасно.</div>
      </section>

      <section className="steps" aria-label="Как это работает">
        <div className="step"><span className="step-number">01</span><div><h3>Откройте диалог</h3><p>Один клик, чтобы начать.</p></div></div>
        <div className="step"><span className="step-number">02</span><div><h3>Сделайте выбор</h3><p>Подтвердите или отмените действие.</p></div></div>
        <div className="step"><span className="step-number">03</span><div><h3>Продолжайте спокойно</h3><p>Вы управляете тем, что происходит.</p></div></div>
      </section>
    </main>

    <footer className="site-footer"><span>С заботой о вашем выборе</span><span className="footer-mark">форма © {new Date().getFullYear()}</span></footer>

    <Modal open={open} onOpenChange={(nextOpen) => {if (!nextOpen) finish(false);}} initialFocus={cancelRef} aria-labelledby="dialog-title" aria-describedby="dialog-description" contentClassName="confirmation-modal">
      <div className="modal-body">
        <button className="close-button" aria-label="Закрыть диалог" onClick={() => finish(false)}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
        <div className="action-icon modal-icon"><ActionIcon /></div>
        <span className="card-eyebrow">ЕЩЁ ОДИН МОМЕНТ</span>
        <h2 id="dialog-title">Подтвердить действие?</h2>
        <p id="dialog-description">Вы собираетесь выполнить действие. Нажмите «Подтвердить», чтобы продолжить, или «Отменить», чтобы вернуться.</p>
      </div>
      <div className="modal-actions">
        <Button ref={cancelRef} view="outlined" size="xl" onClick={() => finish(false)}>Отменить</Button>
        <Button view="action" size="xl" className="primary-button" onClick={() => finish(true)}>Подтвердить</Button>
      </div>
    </Modal>
  </div>;
}
