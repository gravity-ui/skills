import {useEffect, useRef, useState, type FormEvent} from 'react';
import {Avatar, Button, Checkbox, Icon, Modal, Select, Switch, Text, TextInput, configure} from '@gravity-ui/uikit';
import {AsideHeader} from '@gravity-ui/navigation';
import {ArrowUpFromLine, ArrowRight, Bell, Check, ChevronRight, CircleCheck, CircleInfo, CircleQuestion, Envelope, Gear, Globe, Lock, Person, ShieldCheck} from '@gravity-ui/icons';
import './styles.css';

configure({lang: 'ru'});
const STORAGE_KEY = 'forma-profile-v1';
type Profile = {name: string; email: string; avatar: string; language: string; timezone: string; twoFactor: boolean; news: boolean; alerts: boolean; digest: boolean};
const initialProfile: Profile = {name: 'Александр Кузнецов', email: 'alex.kuznetsov@gmail.com', avatar: '/avatar.jpg', language: 'ru', timezone: 'Europe/Moscow', twoFactor: false, news: true, alerts: true, digest: false};
function loadProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (value && Object.keys(initialProfile).every(key => typeof value[key] === typeof initialProfile[key as keyof Profile])) return value;
  } catch { /* Use defaults if browser storage is unavailable. */ }
  return {...initialProfile};
}
const timezones = [
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Europe/London', content: 'Лондон · Europe/London'},
  {value: 'Europe/Berlin', content: 'Берлин · Europe/Berlin'},
  {value: 'America/New_York', content: 'Нью-Йорк · America/New_York'},
  {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
];
function BrandMark() { return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect width="32" height="32" rx="10" fill="currentColor"/><path d="M10 9h13v5h-8v4h6v5h-6v4h-5V9Z" fill="var(--g-color-text-brand-contrast)"/><path d="m10 9 5-4v4h-5Z" fill="var(--g-color-text-brand-contrast)" opacity=".55"/></svg>; }
function SectionIntro({icon, title, children}: {icon: typeof Person; title: string; children: React.ReactNode}) {
  return <div className="section-intro"><div className="section-title"><Icon data={icon} size={18}/><Text as="h2" variant="subheader-2">{title}</Text></div><Text as="p" variant="body-1" color="secondary">{children}</Text></div>;
}
export function App() {
  const [saved, setSaved] = useState(loadProfile);
  const [profile, setProfile] = useState<Profile>(() => ({...saved}));
  const [activeSection, setActiveSection] = useState('profile');
  const [compact, setCompact] = useState(() => window.innerWidth < 900);
  const [help, setHelp] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadVersion = useRef(0);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const nameError = !profile.name.trim() ? 'Укажите ваше имя' : '';
  const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? 'Введите корректный email' : '';
  useEffect(() => {
    const resize = () => setCompact(window.innerWidth < 900);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {e.preventDefault(); e.returnValue = '';};
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(p => ({...p, [key]: value})); setNotice(''); setError('');
  }
  function jump(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  function uploadAvatar() {
    // Native file picker is opened by a Gravity Button; UIKit has no file input control.
    const picker = document.createElement('input');
    picker.type = 'file'; picker.accept = 'image/jpeg,image/png,image/webp';
    picker.onchange = () => {
      const file = picker.files?.[0];
      if (!file) return;
      setError(''); setNotice('');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {setError('Выберите изображение в формате JPG, PNG или WebP.'); return;}
      if (file.size > 5 * 1024 * 1024) {setError('Размер изображения не должен превышать 5 МБ.'); return;}
      const version = ++uploadVersion.current;
      setUploading(true);
      const reader = new FileReader();
      reader.onerror = () => {if (version === uploadVersion.current) {setError('Не удалось прочитать файл. Попробуйте другое изображение.'); setUploading(false);}};
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          if (version !== uploadVersion.current) return;
          const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
          const context = canvas.getContext('2d');
          if (context) {
            const side = Math.min(image.width, image.height);
            context.drawImage(image, (image.width-side)/2, (image.height-side)/2, side, side, 0, 0, 256, 256);
            update('avatar', canvas.toDataURL('image/png'));
          } else setError('Не удалось обработать изображение.');
          setUploading(false);
        };
        image.onerror = () => {if (version === uploadVersion.current) {setError('Не удалось открыть изображение. Выберите другой файл.'); setUploading(false);}};
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    };
    picker.click();
  }
  function save(e: FormEvent) {
    e.preventDefault(); setAttempted(true); setNotice('');
    if (nameError || emailError) {jump('profile'); document.getElementById(nameError ? 'name' : 'email')?.focus(); return;}
    try {
      const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next); setProfile(next); setError(''); setNotice('Изменения сохранены'); setAttempted(false);
    } catch {setError('Не удалось сохранить настройки в браузере. Проверьте доступ к локальному хранилищу.');}
  }
  function cancel() {
    uploadVersion.current++; setUploading(false); setProfile({...saved}); setAttempted(false); setError(''); setNotice('Изменения отменены');
  }
  const avatar = (size: 'm' | 's' | 'xl') => profile.avatar
    ? <Avatar size={size} imgUrl={profile.avatar} alt="Аватар профиля"/>
    : <Avatar size={size} text={profile.name || 'Профиль'} theme="brand"/>;
  return <AsideHeader className="app-shell" compact={compact} onChangeCompact={setCompact} hideCollapseButton hideSectionDividers
    logo={{text: 'forma', icon: BrandMark, iconSize: 32, textSize: 27, className: 'brand', onClick: () => jump('profile')}}
    aboveMenuContent={!compact && <div className="nav-eyebrow">ЛИЧНЫЙ КАБИНЕТ</div>}
    menuItems={[
      {id: 'profile', title: 'Мой профиль', icon: Person, current: activeSection === 'profile', onItemClick: () => jump('profile'), className: 'nav-item'},
      {id: 'security', title: 'Безопасность', icon: ShieldCheck, current: activeSection === 'security', onItemClick: () => jump('security'), className: 'nav-item'},
      {id: 'notifications', title: 'Уведомления', icon: Bell, current: activeSection === 'notifications', onItemClick: () => jump('notifications'), className: 'nav-item'},
    ]}
    renderFooter={() => <div className="sidebar-footer">{!compact && <div className="help-card"><div className="help-card-icon"><Icon data={CircleQuestion} size={21}/></div><Text variant="subheader-1">Всегда рядом</Text><p>Поможем разобраться<br/>с настройками аккаунта.</p><Button view="flat" size="m" onClick={() => setHelp(true)}>Центр помощи <Icon data={ArrowRight} size={14}/></Button></div>}<div className="sidebar-user">{avatar('s')}{!compact && <div className="sidebar-user-info"><strong>{saved.name}</strong><span>Личный аккаунт</span></div>}{!compact && <Icon data={ChevronRight} size={15}/>}</div></div>}
    renderContent={() => <>
      <header className="topbar"><div className="breadcrumbs"><Icon data={Gear} size={17}/><span>Настройки</span><Icon data={ChevronRight} size={13}/><span className="breadcrumb-current">Мой профиль</span></div><div className="topbar-right"><Button view="flat" size="m" onClick={() => setHelp(true)} aria-label="Открыть помощь"><Icon data={CircleQuestion} size={18}/><span className="help-button-text">Помощь</span></Button><span className="topbar-divider"/>{avatar('s')}</div></header>
      <main className="main-content">
        <div className="page-heading"><div><div className="page-eyebrow">ВАШЕ ПРОСТРАНСТВО</div><Text as="h1" variant="display-1">Настройки профиля</Text><Text as="p" variant="body-2" color="secondary">Всё, что делает ваш аккаунт по-настоящему вашим.</Text></div><span className="account-badge"><span/>Личный аккаунт</span></div>
        <form className="settings-card" onSubmit={save} noValidate>
          <div className="card-heading"><div className="card-heading-icon"><Icon data={Person} size={20}/></div><div><Text as="h2" variant="subheader-3">Ваш профиль</Text><Text as="p" variant="body-1" color="secondary">Управляйте личными данными и предпочтениями.</Text></div><span className="profile-card-dots" aria-hidden="true">•••</span></div>
          <section className="settings-section profile-section" id="profile">
            <SectionIntro icon={Person} title="Личные данные">Так вас будут видеть<br className="desktop-break"/> другие участники.</SectionIntro>
            <div className="section-content"><div className="avatar-row"><div className="large-avatar">{avatar('xl')}<span className="avatar-check"><Icon data={Check} size={11}/></span></div><div className="avatar-controls"><div className="avatar-buttons"><Button size="m" view="outlined" onClick={uploadAvatar} loading={uploading}><Icon data={ArrowUpFromLine} size={15}/>Загрузить фото</Button><Button view="flat-secondary" size="m" disabled={!profile.avatar || uploading} onClick={() => update('avatar', '')}>Удалить</Button></div><Text as="p" variant="caption-2" color="secondary">JPG, PNG или WebP. Не более 5 МБ.</Text></div></div><div className="field-grid"><div className="field"><label htmlFor="name">Имя</label><TextInput id="name" size="l" value={profile.name} onUpdate={v => update('name', v)} placeholder="Ваше имя" autoComplete="name" validationState={attempted && nameError ? 'invalid' : undefined} errorMessage={attempted ? nameError : undefined}/></div><div className="field"><label htmlFor="email">Email</label><TextInput id="email" type="email" size="l" value={profile.email} onUpdate={v => update('email', v)} autoComplete="email" startContent={<Icon data={Envelope} size={16}/>} validationState={attempted && emailError ? 'invalid' : undefined} errorMessage={attempted ? emailError : undefined}/></div></div><Text as="p" className="field-note" variant="caption-2" color="secondary"><Icon data={Lock} size={12}/>Ваш email виден только вам.</Text></div>
          </section>
          <section className="settings-section" id="preferences"><SectionIntro icon={Globe} title="Язык и регион">Привычный язык<br className="desktop-break"/> и удобное время.</SectionIntro><div className="section-content"><div className="field-grid"><div className="field"><label id="language-label">Язык интерфейса</label><Select aria-labelledby="language-label" size="l" width="max" value={[profile.language]} onUpdate={v => update('language', v[0])} options={[{value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'}, {value: 'de', content: 'Deutsch'}, {value: 'es', content: 'Español'}, {value: 'fr', content: 'Français'}]}/></div><div className="field"><label id="timezone-label">Часовой пояс</label><Select aria-labelledby="timezone-label" size="l" width="max" value={[profile.timezone]} onUpdate={v => update('timezone', v[0])} filterable filterPlaceholder="Найти часовой пояс" options={timezones}/></div></div><Text as="p" className="field-note" variant="caption-2" color="secondary">Часовой пояс используется для уведомлений и событий.</Text></div></section>
          <section className="settings-section" id="security"><SectionIntro icon={ShieldCheck} title="Безопасность">Дополнительная защита<br className="desktop-break"/> вашего аккаунта.</SectionIntro><div className="section-content"><div className={`security-setting ${profile.twoFactor ? 'security-enabled' : ''}`}><div className="security-icon"><Icon data={ShieldCheck} size={22}/></div><div className="security-copy"><label htmlFor="two-factor">Двухфакторная авторизация</label><p>Подтверждайте вход дополнительным кодом.</p></div><Switch id="two-factor" size="m" checked={profile.twoFactor} onUpdate={v => update('twoFactor', v)}/></div><div className="security-note"><Icon data={CircleInfo} size={13}/><span>{profile.twoFactor ? 'Предпочтение включено. Подключение 2FA требует сервера авторизации.' : 'Рекомендуем включить для защиты личных данных.'}</span></div></div></section>
          <section className="settings-section notifications-section" id="notifications"><SectionIntro icon={Bell} title="Email-уведомления">Выбирайте, что вы хотите<br className="desktop-break"/> получать на почту.</SectionIntro><div className="section-content notification-options">{([
            ['news', 'Новости продукта', 'Новые возможности, улучшения и важные обновления.'],
            ['alerts', 'Системные алерты', 'Важные события и изменения в вашем аккаунте.'],
            ['digest', 'Дайджест за неделю', 'Самое интересное за неделю в одном письме.'],
          ] as const).map(([key, title, description]) => <Checkbox key={key} size="m" checked={profile[key]} onUpdate={v => update(key, v)}><span className="notification-label">{title}</span><span className="notification-description">{description}</span></Checkbox>)}</div></section>
          {(error || notice) && <div className={`feedback ${error ? 'feedback-error' : ''}`} role={error ? 'alert' : 'status'}><Icon data={error ? CircleInfo : CircleCheck} size={17}/>{error || notice}</div>}
          <footer className="form-footer"><span className={`save-hint ${dirty ? 'is-dirty' : ''}`}><span/>{dirty ? 'Есть несохранённые изменения' : 'Всё актуально. Вы в порядке.'}</span><div className="footer-actions"><Button view="outlined" size="l" onClick={cancel}>Отмена</Button><Button type="submit" size="l" view="action" disabled={uploading}><Icon data={Check} size={16}/>Сохранить</Button></div></footer>
        </form>
        <div className="privacy-note"><Icon data={Lock} size={13}/><span>Ваши данные под защитой и доступны только вам.</span></div><div className="page-footer"><span>© {new Date().getFullYear()} Forma</span><span>Меньше шума. Больше вашего.</span></div>
      </main>
      <Modal open={help} onClose={() => setHelp(false)} aria-labelledby="help-title"><div className="help-modal"><div className="modal-icon"><Icon data={CircleQuestion} size={28}/></div><Text as="h2" id="help-title" variant="header-1">Настройки под вашим контролем</Text><p>Измените данные профиля и нажмите «Сохранить». Настройки сохраняются в этом браузере и остаются после перезагрузки страницы.</p><p>«Отмена» вернёт последние сохранённые значения. Для аватара подойдёт изображение JPG, PNG или WebP до 5 МБ.</p><div className="demo-note"><Icon data={CircleInfo} size={18}/><span>Это локальная версия страницы. Язык, часовой пояс, 2FA и подписки сохраняются как предпочтения. Для перевода интерфейса, защиты входа и отправки писем требуется подключение приложения.</span></div><Button view="action" size="l" width="max" onClick={() => setHelp(false)}>Всё понятно</Button></div></Modal>
    </>}/>;
}
