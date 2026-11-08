import {useEffect, useRef, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import './styles.css';

type Kind = 'success' | 'info' | 'error';
type Position = 'bottom' | 'top';
const messages = {
  success: {label: 'Успех', title: 'Всё получилось!', description: 'Изменения успешно сохранены.'},
  info: {label: 'Информация', title: 'Есть кое-что новое', description: 'Все обновления уже доступны.'},
  error: {label: 'Ошибка', title: 'Что-то пошло не так', description: 'Попробуйте ещё раз чуть позже.'},
};

function Icon({name, size = 20}: {name: string; size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'check' && <path d="m6 12 4 4 8-8"/>}
    {name === 'success' && <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>}
    {name === 'info' && <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>}
    {name === 'error' && <><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></>}
    {name === 'close' && <path d="m6 6 12 12M18 6 6 18"/>}
    {name === 'bell' && <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/><path d="M12 2V1"/></>}
    {name === 'clock' && <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>}
    {name === 'cursor' && <path d="m5 3 5 17 3-7 7-3L5 3Z"/>}
    {name === 'layers' && <><path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/></>}
    {name === 'spark' && <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>}
  </svg>;
}

export function App() {
  const [kind, setKind] = useState<Kind>('success');
  const [duration, setDuration] = useState(5);
  const [position, setPosition] = useState<Position>('bottom');
  const [toast, setToast] = useState<{id: number; kind: Kind; duration: number; position: Position} | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const nextId = useRef(0);
  useEffect(() => () => {clearTimeout(timer.current); clearTimeout(closeTimer.current);}, []);

  function dismiss() {
    clearTimeout(timer.current);
    clearTimeout(closeTimer.current);
    setLeaving(true);
    closeTimer.current = setTimeout(() => {setToast(null); setLeaving(false);}, 200);
  }
  function showToast() {
    clearTimeout(timer.current);
    clearTimeout(closeTimer.current);
    setLeaving(false);
    setToast({id: ++nextId.current, kind, duration, position});
    timer.current = setTimeout(dismiss, duration * 1000);
  }

  return <div className="app-shell">
    <header className="header">
      <a className="brand" href="#" aria-label="Moment — главная"><span className="brand-symbol"><i/><i/><i/><i/></span>moment<span className="brand-period">.</span></a>
      <nav aria-label="Основная навигация"><a className="nav-active" href="#playground">Песочница</a><a href="#how-it-works">Как это работает <span>↗</span></a></nav>
      <span className="header-note"><span/> Маленькие детали. Большая разница.</span>
    </header>
    <main>
      <div className="intro">
        <div className="eyebrow"><Icon name="spark" size={14}/> В НУЖНЫЙ МОМЕНТ</div>
        <h1>Всё важное — на мгновение.</h1>
        <p>Лёгкие уведомления, которые появляются вовремя<br className="desktop-break"/> и исчезают сами. Попробуйте, как это работает.</p>
      </div>
      <section className="playground" id="playground" aria-label="Настройки уведомления">
        <div className="settings">
          <div className="section-heading"><span className="small-icon"><Icon name="bell" size={18}/></span><h2>Ваше уведомление</h2><span className="tag">DEMO</span></div>
          <p className="section-description">Настройте под себя. Остальное — за нами.</p>
          <fieldset><legend>Тип уведомления</legend><div className="kind-options">{(Object.keys(messages) as Kind[]).map(type => <button key={type} className={`kind-option ${kind === type ? 'selected' : ''}`} aria-pressed={kind === type} onClick={() => setKind(type)}><Icon name={type} size={17}/>{messages[type].label}</button>)}</div></fieldset>
          <fieldset><legend>Время на экране <span className="field-hint">и исчезнет само</span></legend><div className="duration-options">{[3, 5, 8].map(seconds => <button key={seconds} aria-pressed={duration === seconds} className={duration === seconds ? 'selected' : ''} onClick={() => setDuration(seconds)}>{seconds} {seconds === 3 ? 'секунды' : 'секунд'}</button>)}</div></fieldset>
          <fieldset className="position-field"><legend>Расположение</legend><div className="position-options">{(['bottom', 'top'] as Position[]).map(value => <button key={value} aria-pressed={position === value} className={position === value ? 'selected' : ''} onClick={() => setPosition(value)}><span className={`position-icon ${value}`}><i/></span>{value === 'bottom' ? 'Справа внизу' : 'Справа вверху'}{position === value && <Icon name="check" size={15}/>}</button>)}</div></fieldset>
          <div className="settings-footnote"><Icon name="info" size={15}/><span>Никаких лишних действий. Просто нажмите кнопку.</span></div>
        </div>
        <div className={`preview preview-${kind}`}>
          <div className="preview-top"><span><i/> ПРЕДПРОСМОТР</span><span>0{(['success', 'info', 'error'] as Kind[]).indexOf(kind) + 1} / 03</span></div>
          <div className="preview-stage">
            <div className="orbit orbit-outer"/><div className="orbit orbit-inner"/>
            <span className="decoration star-one">✦</span><span className="decoration star-two">✧</span><span className="decoration dot-one"/><span className="decoration dot-two"/>
            <div className={`hero-icon ${kind}`}><Icon name={kind === 'success' ? 'check' : kind} size={37}/></div>
            <div className={`preview-toast notification ${kind}`}><span className="toast-symbol"><Icon name={kind} size={21}/></span><div><strong>{messages[kind].title}</strong><p>{messages[kind].description}</p></div><span className="preview-close"><Icon name="close" size={15}/></span><div className="preview-progress"/></div>
            <span className="preview-caption"><Icon name="clock" size={13}/> Исчезнет через {duration} {duration === 3 ? 'секунды' : 'секунд'}</span>
          </div>
          <div className="preview-bottom"><span>Заметно. Ненавязчиво. Вовремя.</span><div className="preview-dots">{(['success', 'info', 'error'] as Kind[]).map(type => <button key={type} className={kind === type ? 'active' : ''} aria-label={`Предпросмотр: ${messages[type].label}`} aria-pressed={kind === type} onClick={() => setKind(type)}/>)}</div></div>
        </div>
      </section>
      <section className="features" id="how-it-works" aria-label="Как это работает">
        <div className="feature"><span className="feature-icon"><Icon name="cursor"/></span><div><h3>Один клик — и готово</h3><p>Нажмите кнопку в углу экрана,<br/>чтобы показать уведомление.</p></div></div>
        <div className="feature"><span className="feature-icon"><Icon name="clock"/></span><div><h3>Исчезает само</h3><p>Через несколько секунд уведомление<br/>плавно освободит экран.</p></div></div>
        <div className="feature"><span className="feature-icon"><Icon name="layers"/></span><div><h3>Не отвлекает от главного</h3><p>Оставайтесь в потоке — всё важное<br/>всегда будет под рукой.</p></div></div>
      </section>
      <div className="page-note"><span/> Чуть меньше шума. Чуть больше спокойствия.</div>
    </main>
    <footer><span>moment © {new Date().getFullYear()}</span><span>Сделано с вниманием к деталям <Icon name="spark" size={13}/></span></footer>
    <div className="trigger-wrap"><span className="try-hint">Попробуйте прямо сейчас <span>↘</span></span><Button className="trigger-button" view="action" size="xl" onClick={showToast}><Icon name="bell" size={19}/><span>Показать уведомление</span><span className="button-plus">+</span></Button></div>
    <div className={`toast-region ${toast?.position === 'top' ? 'toast-top' : ''}`} role="status" aria-live="polite" aria-atomic="true">{toast && <div key={toast.id} className={`notification live-toast ${toast.kind} ${leaving ? 'leaving' : ''}`}><span className="toast-symbol"><Icon name={toast.kind} size={22}/></span><div><strong>{messages[toast.kind].title}</strong><p>{messages[toast.kind].description}</p></div><button className="close-toast" aria-label="Закрыть уведомление" onClick={dismiss}><Icon name="close" size={17}/></button><div className="toast-progress" style={{animationDuration: `${toast.duration}s`}}/></div>}</div>
  </div>;
}
