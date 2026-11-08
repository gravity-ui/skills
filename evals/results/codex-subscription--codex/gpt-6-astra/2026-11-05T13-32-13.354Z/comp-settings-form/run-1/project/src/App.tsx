import {useRef, useState, type ChangeEvent, type FormEvent} from 'react';
import './styles.css';

type IconName = 'user' | 'shield' | 'bell' | 'globe' | 'arrow' | 'chevron' | 'upload' | 'check' | 'help' | 'mail' | 'close' | 'menu' | 'sun';
function Icon({name, size = 20, className = ''}: {name: IconName; size?: number; className?: string}) {
  const paths: Record<IconName, React.ReactNode> = {
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
    arrow: <><path d="M5 12h14m-5-5 5 5-5 5"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    upload: <><path d="M12 16V3m-4 4 4-4 4 4M4 15v5h16v-5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4M12 17h.01"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/></>,
  };
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

type Profile = {name: string; email: string; avatar: string; language: string; timezone: string; twoFactor: boolean; news: boolean; alerts: boolean; digest: boolean};
const defaults: Profile = {name: 'Александр Смирнов', email: 'alex.smirnov@gmail.com', avatar: '', language: 'ru', timezone: 'Europe/Moscow', twoFactor: false, news: true, alerts: true, digest: false};
const storageKey = 'forma-profile-v1';
function readProfile(): Profile {
  try { const value = JSON.parse(localStorage.getItem(storageKey) || 'null'); return value && typeof value.name === 'string' && typeof value.email === 'string' ? {...defaults, ...value} : defaults; } catch { return defaults; }
}
const navigation: {id: string; label: string; icon: IconName}[] = [
  {id: 'profile', label: 'Мой профиль', icon: 'user'},
  {id: 'region', label: 'Язык и регион', icon: 'globe'},
  {id: 'security', label: 'Безопасность', icon: 'shield'},
  {id: 'notifications', label: 'Уведомления', icon: 'bell'},
];
function Avatar({profile, small = false}: {profile: Profile; small?: boolean}) {
  const initials = profile.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'АС';
  return <div className={`avatar ${small ? 'avatar-small' : ''}`}>{profile.avatar ? <img src={profile.avatar} alt="Аватар профиля"/> : <span>{initials}</span>}</div>;
}
export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [active, setActive] = useState('profile');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const change = <K extends keyof Profile>(key: K, value: Profile[K]) => {setProfile(p => ({...p, [key]: value})); setNotice(''); setError('');};
  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {setError('Выберите изображение в формате JPG, PNG или WebP.'); return;}
    if (file.size > 5 * 1024 * 1024) {setError('Размер изображения не должен превышать 5 МБ.'); return;}
    const reader = new FileReader();
    reader.onerror = () => setError('Не удалось прочитать файл. Попробуйте другое изображение.');
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => setError('Не удалось открыть изображение. Попробуйте другой файл.');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, 256, 256);
        change('avatar', canvas.toDataURL('image/png'));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {setError('Укажите ваше имя.'); document.getElementById('name')?.focus(); return;}
    const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
    try {localStorage.setItem(storageKey, JSON.stringify(next)); setSaved(next); setProfile(next); setError(''); setNotice('Настройки успешно сохранены');}
    catch {setError('Не удалось сохранить настройки в браузере. Проверьте доступ к локальному хранилищу.');}
  };
  const cancel = () => {setProfile({...saved}); setError(''); setNotice('Изменения отменены');};
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <a className="brand" href="#profile" aria-label="Forma — настройки профиля"><span className="brand-mark"><i/><i/><i/></span>forma<span className="brand-dot">.</span></a>
      <div className="workspace-label"><span className="workspace-icon"><Icon name="sun" size={18}/></span><div>Личное пространство<span>Ваш аккаунт в Forma</span></div></div>
      <div className="nav-caption">НАСТРОЙКИ АККАУНТА</div>
      <nav aria-label="Настройки аккаунта">{navigation.map(item => <a key={item.id} className={`nav-link ${active === item.id ? 'active' : ''}`} href={`#${item.id}`} onClick={() => {setActive(item.id); setMobileOpen(false);}}><Icon name={item.icon}/><span>{item.label}</span>{active === item.id && <span className="active-dot"/>}</a>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><Icon name="help" size={20}/></span><h3>Всё под вашим контролем</h3><p>Настройте Forma так, чтобы<br/>вам было удобно.</p><button type="button" className="help-link" onClick={() => setHelpOpen(true)}>Нужна помощь? <Icon name="arrow" size={16}/></button></div>
      <div className="sidebar-user"><Avatar profile={saved} small/><div><strong>{saved.name}</strong><span>Личный аккаунт</span></div><span className="online-dot" title="Аккаунт активен"/></div></div>
      <div className="sidebar-footer">© {new Date().getFullYear()} Forma <span>Пространство для вас</span></div>
    </aside>
    {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Закрыть меню"/>}
    <main>
      <div className="topbar"><div className="breadcrumb"><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Открыть меню"><Icon name="menu"/></button><span>Аккаунт</span><span className="breadcrumb-slash">/</span><strong>Настройки профиля</strong></div><span className="private-label"><Icon name="shield" size={15}/> Личное пространство</span></div>
      <div className="content"><header className="page-header"><div className="eyebrow">ВАШ АККАУНТ</div><h1>Настройки профиля<span className="heading-dot">.</span></h1><p>Ваши данные, предпочтения и немного больше комфорта.</p></header>
      <form onSubmit={save}>
        <div className="settings-card">
          <section className="settings-section profile-section" id="profile"><div className="section-description"><span className="section-icon"><Icon name="user"/></span><h2>Личные данные</h2><p>Расскажите немного о себе.<br/>Так вас узнают в пространстве.</p></div><div className="section-fields"><div className="avatar-row"><div className="avatar-wrap"><Avatar profile={profile}/><span className="avatar-status"><Icon name="check" size={10}/></span></div><div><div className="avatar-actions"><button className="button button-small" type="button" onClick={() => fileRef.current?.click()}><Icon name="upload" size={15}/>Загрузить фото</button>{profile.avatar && <button type="button" className="remove-photo" onClick={() => change('avatar', '')}>Удалить</button>}</div><p className="field-hint">JPG, PNG или WebP. Не более 5 МБ.</p><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="visually-hidden" aria-label="Загрузить аватар" tabIndex={-1}/></div></div>
            <div className="two-columns"><label className="field-label" htmlFor="name">Имя<input id="name" value={profile.name} onChange={e => change('name', e.target.value)} placeholder="Ваше имя" required maxLength={100} autoComplete="name"/></label><label className="field-label" htmlFor="email">Email<div className="input-with-icon"><Icon name="mail" size={17}/><input id="email" type="email" value={profile.email} onChange={e => change('email', e.target.value)} placeholder="you@example.com" required autoComplete="email"/></div></label></div>
          </div></section>
          <section className="settings-section region-section" id="region"><div className="section-description"><span className="section-icon"><Icon name="globe"/></span><h2>Язык и регион</h2><p>Пусть всё будет привычным.</p></div><div className="section-fields two-columns"><label className="field-label" htmlFor="language">Язык интерфейса<div className="select-wrap"><select id="language" value={profile.language} onChange={e => change('language', e.target.value)}><option value="ru">Русский</option><option value="en">English</option><option value="de">Deutsch</option><option value="fr">Français</option><option value="es">Español</option></select><Icon name="chevron" size={16}/></div><span className="field-hint">Язык вашего пространства.</span></label><label className="field-label" htmlFor="timezone">Часовой пояс<div className="select-wrap"><select id="timezone" value={profile.timezone} onChange={e => change('timezone', e.target.value)}><option value="Europe/Moscow">(UTC+03:00) Москва</option><option value="Europe/Kaliningrad">(UTC+02:00) Калининград</option><option value="Europe/Samara">(UTC+04:00) Самара</option><option value="Asia/Yekaterinburg">(UTC+05:00) Екатеринбург</option><option value="Asia/Omsk">(UTC+06:00) Омск</option><option value="Asia/Novosibirsk">(UTC+07:00) Новосибирск</option><option value="Asia/Irkutsk">(UTC+08:00) Иркутск</option><option value="Asia/Yakutsk">(UTC+09:00) Якутск</option><option value="Asia/Vladivostok">(UTC+10:00) Владивосток</option><option value="Asia/Magadan">(UTC+11:00) Магадан</option><option value="Asia/Kamchatka">(UTC+12:00) Камчатка</option><option value="UTC">(UTC+00:00) UTC</option><option value="Europe/London">Лондон (Europe/London)</option><option value="Europe/Berlin">Берлин (Europe/Berlin)</option><option value="America/New_York">Нью-Йорк (America/New_York)</option></select><Icon name="chevron" size={16}/></div><span className="field-hint">Для правильного времени событий.</span></label></div></section>
          <section className="settings-section security-section" id="security"><div className="section-description"><span className="section-icon"><Icon name="shield"/></span><h2>Безопасность</h2><p>Дополнительная забота об аккаунте.</p></div><div className="section-fields security-content"><div><label className="control-title" htmlFor="two-factor">Двухфакторная авторизация <span className="recommended">Рекомендуем</span></label><p className="control-description">Дополнительный уровень защиты<br className="desktop-break"/> при входе в аккаунт.</p></div><label className="switch"><input id="two-factor" type="checkbox" role="switch" checked={profile.twoFactor} onChange={e => change('twoFactor', e.target.checked)}/><span className="switch-track"/></label></div></section>
          <section className="settings-section notification-section" id="notifications"><div className="section-description"><span className="section-icon"><Icon name="bell"/></span><h2>Email-уведомления</h2><p>Только то, что вам интересно.<br/>Без лишнего шума.</p></div><div className="section-fields notification-list">{([{key:'news', title:'Новости продукта', description:'Новые возможности и полезные обновления.'},{key:'alerts', title:'Системные алерты', description:'Важные события и безопасность аккаунта.'},{key:'digest', title:'Дайджест за неделю', description:'Всё самое важное — в одном письме.'}] as const).map(item => <label className="checkbox-row" key={item.key}><input type="checkbox" checked={profile[item.key]} onChange={e => change(item.key, e.target.checked)}/><span className="custom-checkbox"><Icon name="check" size={13}/></span><span><span className="control-title">{item.title}</span><span className="control-description">{item.description}</span></span></label>)}</div></section>
        </div>
        <div className="form-footer"><div className={`save-note ${notice ? 'success-note' : ''}`} role="status"><Icon name={notice ? 'check' : dirty ? 'sun' : 'shield'} size={16}/><span>{notice || (dirty ? 'Есть несохранённые изменения' : 'Ваши данные видны только вам')}</span></div><div className="form-actions"><button type="button" className="button cancel-button" onClick={cancel}>Отмена</button><button type="submit" className="button primary-button"><Icon name="check" size={17}/>Сохранить</button></div></div>
        {error && <div className="error-message" role="alert">{error}<button type="button" onClick={() => setError('')} aria-label="Закрыть ошибку"><Icon name="close" size={16}/></button></div>}
      </form><div className="page-footnote"><span className="footnote-line"/>Маленькие настройки. Больше удобства.<span className="footnote-line"/></div></div>
    </main>
    {helpOpen && <div className="modal-overlay" onClick={() => setHelpOpen(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()} onKeyDown={e => {if (e.key === 'Escape') setHelpOpen(false);}}><button autoFocus className="modal-close" onClick={() => setHelpOpen(false)} aria-label="Закрыть"><Icon name="close"/></button><span className="section-icon"><Icon name="help"/></span><h2 id="help-title">Ваши настройки в Forma</h2><p>Измените нужные параметры и нажмите «Сохранить». Кнопка «Отмена» вернёт последние сохранённые значения.</p><p>Для аватара подойдёт изображение JPG, PNG или WebP до 5 МБ. Фото автоматически обрезается по центру.</p><div className="help-info">Это локальная версия: настройки сохраняются в этом браузере. Подключение двухфакторной авторизации и отправка уведомлений требуют сервера.</div><button className="button primary-button" onClick={() => setHelpOpen(false)}>Понятно</button></section></div>}
  </div>;
}
