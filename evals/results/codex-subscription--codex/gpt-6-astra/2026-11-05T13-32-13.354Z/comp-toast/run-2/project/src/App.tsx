import { useEffect, useRef, useState } from 'react';
import { Button } from '@gravity-ui/uikit';
import './styles.css';

type Kind = 'success' | 'info' | 'error';
const messages = {
  success: { label: 'Успех', title: 'Всё получилось!', description: 'Изменения успешно сохранены.' },
  info: { label: 'Информация', title: 'Вы в курсе', description: 'Для вас доступно новое обновление.' },
  error: { label: 'Ошибка', title: 'Что-то пошло не так', description: 'Не удалось сохранить изменения. Попробуйте ещё раз.' },
};
function Symbol({ name, size = 20 }: { name: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'bell' ? <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></> :
      name === 'check' ? <path d="m6 12 4 4 8-8"/> :
      name === 'close' ? <><path d="m6 6 12 12M18 6 6 18"/></> :
      name === 'clock' ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> :
      name === 'arrow' ? <path d="M5 12h14m-5-5 5 5-5 5"/> :
      name === 'layers' ? <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></> :
      name === 'spark' ? <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/></> :
      name === 'error' ? <><circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 4h.01"/></> :
      <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/></>}
  </svg>;
}

export function App() {
  const [kind, setKind] = useState<Kind>('success');
  const [duration, setDuration] = useState(5);
  const [toast, setToast] = useState<{ kind: Kind; duration: number; id: number } | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.duration * 1000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!toast) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setToast(null); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [toast]);
  const iconFor = (type: Kind) => type === 'success' ? 'check' : type;
  const message = messages[kind];

  return <div className="app-shell">
    <header className="header">
      <a className="brand" href="./" aria-label="Точка — главная"><span className="brand-symbol"><span/><span/><span/><span/></span>точка<span className="brand-dot">.</span></a>
      <span className="header-divider"/><span className="header-label">Маленькие детали. Большой опыт.</span>
      <span className="library-tag"><span/>Лаборатория интерфейсов</span>
    </header>
    <main>
      <div className="breadcrumbs"><Symbol name="layers" size={16}/><span>Компоненты</span><span className="slash">/</span><span>Уведомления</span></div>
      <div className="page-heading"><div><div className="eyebrow">ОБРАТНАЯ СВЯЗЬ</div><h1>В нужный момент<span>.</span></h1><p className="intro">Небольшое уведомление, чтобы сообщить о важном.<br/>Появляется по клику и исчезает само.</p></div><span className="interactive"><span/>Интерактивный пример</span></div>
      <div className="workspace">
        <section className="preview-panel" aria-labelledby="preview-title">
          <div className="panel-header"><span id="preview-title">Предпросмотр</span><span className="panel-caption">TOAST / 01</span></div>
          <div className="preview-canvas">
            <span className="canvas-label"><span/>Всё внимание — на главном</span>
            <div className="preview-scene">
              <div className="bell-orbit"><div className="bell-tile"><Symbol name="bell" size={31}/><span className="bell-dot"/></div><span className="orbit-dot"/></div>
              <div className={`sample-toast ${kind}`}><span className="status-icon"><Symbol name={iconFor(kind)} size={19}/></span><div><strong>{message.title}</strong><p>{message.description}</p></div><span className="sample-close"><Symbol name="close" size={15}/></span><div className="sample-line"/></div>
              <h2>Сообщили. И не отвлекли.</h2><p className="scene-description">Ничего лишнего между вами<br/>и тем, что вы делаете.</p>
            </div>
            <div className="preview-bottom"><span className="tiny-dot"/>Ненавязчиво. Понятно. Вовремя.</div>
          </div>
          <div className="preview-foot"><Symbol name="info" size={17}/><span>Нажмите на кнопку в правом нижнем углу</span><span className="diagonal-arrow">↘</span></div>
        </section>
        <aside className="settings-panel" aria-labelledby="settings-title">
          <div className="settings-heading"><span className="settings-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 7h16M4 17h16"/><rect x="8" y="4" width="4" height="6" rx="1" fill="white"/><rect x="14" y="14" width="4" height="6" rx="1" fill="white"/></svg></span><h2 id="settings-title">Попробуйте сами</h2></div>
          <p className="settings-intro">Настройте уведомление под себя.</p>
          <fieldset><legend>Тип уведомления</legend><div className="type-options">{(Object.keys(messages) as Kind[]).map(type => <button key={type} className={`type-option ${type} ${kind === type ? 'selected' : ''}`} aria-pressed={kind === type} onClick={() => setKind(type)}><span className="option-icon"><Symbol name={iconFor(type)} size={16}/></span>{messages[type].label}{kind === type && <span className="selected-check"><Symbol name="check" size={15}/></span>}</button>)}</div></fieldset>
          <fieldset className="duration-field"><legend>Время на экране <Symbol name="clock" size={15}/></legend><div className="duration-options">{[3, 5, 8].map(seconds => <button key={seconds} aria-pressed={duration === seconds} className={duration === seconds ? 'active' : ''} onClick={() => setDuration(seconds)}>{seconds} сек</button>)}</div><p className="field-hint">После этого уведомление исчезнет само.</p></fieldset>
          <div className="position-setting"><span>Расположение</span><span className="position-value"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor"/><rect x="10" y="11" width="5" height="3" rx=".7" fill="currentColor"/></svg>Справа внизу</span></div>
          <div className="settings-note"><Symbol name="spark" size={19}/><p>Хорошие интерфейсы<br/>заботятся о мелочах.</p></div>
        </aside>
      </div>
      <div className="features"><div><span className="feature-icon"><Symbol name="clock" size={19}/></span><div><h3>Исчезает само</h3><p>Без лишних действий</p></div></div><div><span className="feature-icon"><Symbol name="layers" size={19}/></span><div><h3>Не мешает работе</h3><p>Оставайтесь в своём потоке</p></div></div><div><span className="feature-icon"><Symbol name="check" size={19}/></span><div><h3>Всё под контролем</h3><p>Можно закрыть в любой момент</p></div></div></div>
      <footer><span>Сделано с вниманием к деталям</span><span className="footer-star">✳</span><span>Один клик — и всё понятно.</span></footer>
    </main>
    <div className="notification-area" aria-live="polite" aria-atomic="true">{toast && <div key={toast.id} className={`live-toast ${toast.kind}`} role="status"><span className="status-icon"><Symbol name={iconFor(toast.kind)} size={20}/></span><div className="toast-text"><strong>{messages[toast.kind].title}</strong><p>{messages[toast.kind].description}</p></div><button className="close-button" aria-label="Закрыть уведомление" onClick={() => setToast(null)}><Symbol name="close" size={17}/></button><div className="toast-progress" style={{ animationDuration: `${toast.duration}s` }}/></div>}</div>
    <div className="trigger-wrap"><Button size="xl" view="action" className="trigger-button" onClick={() => setToast({ kind, duration, id: ++sequence.current })}><span className="trigger-content"><Symbol name="bell" size={19}/><span>Показать уведомление</span><span className="trigger-arrow"><Symbol name="arrow" size={18}/></span></span></Button></div>
  </div>;
}
