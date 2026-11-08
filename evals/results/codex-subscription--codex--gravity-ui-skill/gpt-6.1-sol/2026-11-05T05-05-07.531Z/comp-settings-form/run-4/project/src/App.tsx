import {useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Avatar, Button, Checkbox, Icon, Modal, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowUpFromLine, Bell, Check, ChevronDown, ChevronRight, CircleCheck, CircleQuestion, Envelope, Globe, Lock, Person, ShieldCheck, Xmark} from '@gravity-ui/icons';
import './styles.css';

type Profile = {
  name: string; email: string; avatar: string; language: string; timezone: string;
  twoFactor: boolean; news: boolean; alerts: boolean; digest: boolean;
};
const defaults: Profile = {
  name: 'Александр Иванов', email: 'alex.ivanov@gmail.com', avatar: '/avatar.jpg',
  language: 'ru', timezone: 'Europe/Moscow', twoFactor: false, news: true, alerts: true, digest: false,
};
const storageKey = 'forma-profile-settings-v1';
const languages = [
  {value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'}, {value: 'fr', content: 'Français'},
  {value: 'es', content: 'Español'}, {value: 'zh', content: '中文'},
];
const timezones = [
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Omsk', content: '(UTC+06:00) Омск'},
  {value: 'Asia/Krasnoyarsk', content: '(UTC+07:00) Красноярск'},
  {value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск'},
  {value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Asia/Magadan', content: '(UTC+11:00) Магадан'},
  {value: 'Asia/Kamchatka', content: '(UTC+12:00) Петропавловск-Камчатский'},
  {value: 'Europe/London', content: 'Лондон · Europe/London'},
  {value: 'Europe/Berlin', content: 'Берлин · Europe/Berlin'},
  {value: 'America/New_York', content: 'Нью-Йорк · America/New_York'},
  {value: 'America/Los_Angeles', content: 'Лос-Анджелес · America/Los_Angeles'},
  {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
  {value: 'Asia/Tokyo', content: '(UTC+09:00) Токио'},
];
function readProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!value || typeof value !== 'object') return defaults;
    return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) =>
      [key, typeof value[key] === typeof fallback ? value[key] : fallback],
    )) as Profile;
  } catch { return defaults; }
}
function BrandMark() {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="10" fill="currentColor"/>
    <path d="M16 6.5v19M6.5 16h19M9.3 9.3l13.4 13.4M9.3 22.7 22.7 9.3" stroke="var(--g-color-text-brand-contrast)" strokeWidth="3.8"/>
  </svg>;
}
function SectionIntro({icon, title, children}: {icon: typeof Person; title: string; children: ReactNode}) {
  return <div className="section-intro">
    <div className="section-heading"><Icon data={icon} size={18}/><Text variant="subheader-2">{title}</Text></div>
    <p>{children}</p>
  </div>;
}
export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [errors, setErrors] = useState<{name?: string; email?: string; avatar?: string}>({});
  const [status, setStatus] = useState<{kind: 'success' | 'error' | 'info'; text: string} | null>(null);
  const [uploading, setUploading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [compact, setCompact] = useState(() => window.innerWidth < 1000);
  const [activeSection, setActiveSection] = useState('personal');
  const fileInput = useRef<HTMLInputElement>(null);
  const fileReader = useRef<FileReader | null>(null);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 999px)');
    const update = () => setCompact(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 6000);
    return () => window.clearTimeout(timer);
  }, [status]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(current => ({...current, [key]: value}));
    setStatus(null);
    if (key === 'name' || key === 'email') setErrors(current => ({...current, [key]: undefined}));
  }
  function navigate(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors(current => ({...current, avatar: 'Выберите изображение в формате JPG, PNG или WebP.'}));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(current => ({...current, avatar: 'Размер изображения не должен превышать 5 МБ.'}));
      return;
    }
    setErrors(current => ({...current, avatar: undefined}));
    setUploading(true);
    fileReader.current?.abort();
    const reader = new FileReader();
    fileReader.current = reader;
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        if (fileReader.current !== reader) return;
        // Resize locally so even a large upload fits in browser storage.
        const canvas = document.createElement('canvas');
        const size = Math.min(image.width, image.height);
        canvas.width = 320; canvas.height = 320;
        const context = canvas.getContext('2d');
        if (!context) { setUploading(false); return; }
        context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 320, 320);
        update('avatar', canvas.toDataURL('image/jpeg', 0.88));
        setUploading(false);
      };
      image.onerror = () => {
        if (fileReader.current !== reader) return;
        setErrors(current => ({...current, avatar: 'Не удалось открыть изображение. Выберите другой файл.'}));
        setUploading(false);
      };
      image.src = String(reader.result);
    };
    reader.onerror = () => {
      setErrors(current => ({...current, avatar: 'Не удалось прочитать файл. Попробуйте ещё раз.'}));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const nextErrors = {
      name: profile.name.trim() ? undefined : 'Укажите ваше имя.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) ? undefined : 'Введите корректный email.',
    };
    setErrors(current => ({...current, ...nextErrors}));
    if (nextErrors.name || nextErrors.email) {
      navigate('personal');
      document.getElementById(nextErrors.name ? 'profile-name' : 'profile-email')?.focus();
      return;
    }
    const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next); setProfile(next);
      setStatus({kind: 'success', text: 'Настройки профиля сохранены'});
    } catch {
      setStatus({kind: 'error', text: 'Не удалось сохранить настройки. Проверьте доступ к хранилищу браузера.'});
    }
  }
  function cancel() {
    fileReader.current?.abort(); fileReader.current = null;
    setUploading(false); setProfile(saved); setErrors({});
    setStatus({kind: 'info', text: 'Изменения отменены'});
  }
  const initials = saved.name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('');

  return <>
    <AsideHeader className="app-shell" compact={compact} onChangeCompact={setCompact} hideCollapseButton hideSectionDividers
      logo={{text: 'forma', icon: BrandMark, iconSize: 32, textSize: 27, iconClassName: 'brand-icon', className: 'brand', onClick: () => navigate('personal')}}
      aboveMenuContent={<div className="workspace-caption">ЛИЧНОЕ ПРОСТРАНСТВО</div>}
      menuItems={[
        {id: 'personal', title: 'Мой профиль', icon: Person, current: activeSection === 'personal', onItemClick: () => navigate('personal'), className: 'nav-item'},
        {id: 'regional', title: 'Язык и регион', icon: Globe, current: activeSection === 'regional', onItemClick: () => navigate('regional'), className: 'nav-item'},
        {id: 'security', title: 'Безопасность', icon: ShieldCheck, current: activeSection === 'security', onItemClick: () => navigate('security'), className: 'nav-item'},
        {id: 'notifications', title: 'Уведомления', icon: Bell, current: activeSection === 'notifications', onItemClick: () => navigate('notifications'), className: 'nav-item'},
      ]}
      renderFooter={() => <div className="sidebar-bottom">
        {!compact && <div className="sidebar-note">
          <div className="note-orbit" aria-hidden="true"><span/><span/><span/><i>✳</i></div>
          <Text variant="subheader-2">Ваше пространство.<br/>Ваши правила.</Text>
          <p>Настройте Forma так, как удобно именно вам.</p>
        </div>}
        <Button view="flat" className="help-button" size="l" onClick={() => setHelpOpen(true)} aria-label="Помощь и поддержка"><Icon data={CircleQuestion} size={18}/>{!compact && 'Помощь и поддержка'}</Button>
        <div className="sidebar-user">
          <Avatar size="m" shape="circle" {...(saved.avatar ? {imgUrl: saved.avatar, alt: saved.name, fallbackImgUrl: '/avatar-fallback.svg'} : {text: initials})}/>
          {!compact && <><div className="user-text"><strong>{saved.name}</strong><span>Личный аккаунт</span></div><span className="user-chevron"><Icon data={ChevronDown} size={14}/></span></>}
        </div>
      </div>}
      renderContent={() => <div className="main-layout">
        <header className="topbar">
          <div className="breadcrumbs"><span>Настройки</span><Icon data={ChevronRight} size={13}/><span>Профиль</span></div>
          <div className="topbar-right"><span className="workspace-name">Личное пространство</span><span className="topbar-divider"/><Avatar size="s" shape="circle" {...(saved.avatar ? {imgUrl: saved.avatar, alt: saved.name, fallbackImgUrl: '/avatar-fallback.svg'} : {text: initials})}/></div>
        </header>
        <main className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow">ВАШ АККАУНТ</div><Text variant="display-1" as="h1">Настройки профиля</Text><p>Личные данные и предпочтения — всё в одном месте.</p></div>
            <span className="account-badge"><span/>Личный аккаунт</span>
          </div>
          <form className="settings-card" onSubmit={save} noValidate>
            <section className="settings-section personal-section" id="personal">
              <SectionIntro icon={Person} title="Личная информация">Познакомимся поближе.<br/>Так вас будут видеть в Forma.</SectionIntro>
              <div className="section-fields">
                <div className="avatar-row">
                  <div className="avatar-wrapper"><Avatar className="profile-avatar" size="xl" shape="circle" {...(profile.avatar ? {imgUrl: profile.avatar, alt: 'Фото профиля', fallbackImgUrl: '/avatar-fallback.svg'} : {text: profile.name || 'П'})}/><span className="avatar-check"><Icon data={Check} size={11}/></span></div>
                  <div className="avatar-actions"><div className="avatar-buttons"><Button view="outlined" size="m" onClick={() => fileInput.current?.click()} loading={uploading}><Icon data={ArrowUpFromLine} size={14}/>Загрузить фото</Button>{profile.avatar && <Button view="flat-secondary" size="m" disabled={uploading} onClick={() => update('avatar', '')}>Удалить</Button>}</div><p className="field-hint">JPG, PNG или WebP. Не больше 5 МБ.</p></div>
                  {/* UIKit has no file input component; this native picker is hidden. */}
                  <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="Загрузка аватара" onChange={uploadAvatar}/>
                </div>
                {errors.avatar && <p className="field-error" role="alert">{errors.avatar}</p>}
                <div className="personal-fields">
                  <div className="field"><label htmlFor="profile-name">Имя и фамилия</label><TextInput id="profile-name" value={profile.name} onUpdate={value => update('name', value)} size="l" placeholder="Введите ваше имя" autoComplete="name" errorMessage={errors.name} validationState={errors.name ? 'invalid' : undefined} controlProps={{maxLength: 100, 'aria-required': true}}/></div>
                  <div className="field"><label htmlFor="profile-email">Email</label><TextInput id="profile-email" type="email" value={profile.email} onUpdate={value => update('email', value)} size="l" startContent={<span className="input-icon"><Icon data={Envelope} size={16}/></span>} placeholder="you@example.com" autoComplete="email" errorMessage={errors.email} validationState={errors.email ? 'invalid' : undefined} controlProps={{maxLength: 254, 'aria-required': true, 'aria-describedby': 'email-hint'}}/><p id="email-hint" className="field-hint">Для входа в аккаунт и важных писем.</p></div>
                </div>
              </div>
            </section>
            <section className="settings-section" id="regional">
              <SectionIntro icon={Globe} title="Язык и регион">Чтобы всё было на вашем языке<br className="desktop-break"/> и в вашем времени.</SectionIntro>
              <div className="section-fields regional-fields">
                <div className="field"><label htmlFor="profile-language">Язык интерфейса</label><Select id="profile-language" aria-label="Язык интерфейса" size="l" width="max" value={[profile.language]} options={languages} onUpdate={value => update('language', value[0])}/></div>
                <div className="field"><label htmlFor="profile-timezone">Часовой пояс</label><Select id="profile-timezone" aria-label="Часовой пояс" size="l" width="max" popupWidth="fit" filterable filterPlaceholder="Найти город или часовой пояс" value={[profile.timezone]} options={timezones} onUpdate={value => update('timezone', value[0])}/><p className="field-hint">Для времени событий и уведомлений.</p></div>
              </div>
            </section>
            <section className="settings-section" id="security">
              <SectionIntro icon={ShieldCheck} title="Безопасность">Дополнительная защита<br/>вашего аккаунта.</SectionIntro>
              <div className="section-fields"><div className={`security-control ${profile.twoFactor ? 'is-enabled' : ''}`}><span className="security-icon"><Icon data={Lock} size={19}/></span><div className="security-copy"><div className="security-title">Двухфакторная авторизация <span className="recommended">Рекомендуем</span></div><p>Дополнительный уровень защиты при входе.</p></div><Switch size="m" checked={profile.twoFactor} onUpdate={value => update('twoFactor', value)} controlProps={{'aria-label': 'Двухфакторная авторизация'}}/></div></div>
            </section>
            <section className="settings-section notifications-section" id="notifications">
              <SectionIntro icon={Bell} title="Email-уведомления">Только те письма,<br/>которые вам нужны.</SectionIntro>
              <div className="section-fields notification-options">
                {([
                  ['news', 'Новости продукта', 'Новые возможности, обновления и полезные советы.'],
                  ['alerts', 'Системные алерты', 'Важные события и информация о работе сервиса.'],
                  ['digest', 'Дайджест за неделю', 'Главное за неделю — в одном коротком письме.'],
                ] as const).map(([key, title, description]) => <Checkbox key={key} size="m" checked={profile[key]} onUpdate={value => update(key, value)}><span className="notification-copy"><span className="notification-title">{title}</span><span className="notification-description">{description}</span></span></Checkbox>)}
              </div>
            </section>
            <footer className="form-footer"><div className={`save-note ${dirty ? 'has-changes' : ''}`}><Icon data={dirty ? CircleCheck : Lock} size={14}/><span>{dirty ? 'Есть несохранённые изменения' : 'Ваши данные под вашим контролем'}</span></div><div className="form-actions"><Button size="l" view="outlined" onClick={cancel}>Отмена</Button><Button size="l" view="action" type="submit" disabled={uploading}><Icon data={Check} size={16}/>Сохранить</Button></div></footer>
          </form>
          <div className="page-footer"><span>Маленькие настройки. Большое удобство.</span><span>Сделано для вас <span className="footer-asterisk">✳</span></span></div>
        </main>
      </div>}
    />
    {status && <div className={`status-toast status-${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}><Icon data={status.kind === 'success' ? CircleCheck : CircleQuestion} size={20}/><span>{status.text}</span><Button view="flat" size="s" onClick={() => setStatus(null)} aria-label="Закрыть уведомление"><Icon data={Xmark} size={14}/></Button></div>}
    <Modal open={helpOpen} onOpenChange={setHelpOpen} aria-labelledby="help-title"><div className="help-modal"><span className="help-modal-icon"><Icon data={CircleQuestion} size={26}/></span><Text id="help-title" variant="header-1" as="h2">Всё под вашим контролем</Text><p>Здесь можно обновить личные данные, загрузить фото и выбрать подходящие уведомления.</p><p>Нажмите «Сохранить», чтобы применить настройки. «Отмена» вернёт последние сохранённые значения.</p><div className="help-local-note"><Icon data={Lock} size={16}/><span>В этой версии настройки хранятся только в вашем браузере. Двухфакторная авторизация требует подключения сервера.</span></div><Button view="action" size="l" width="max" onClick={() => setHelpOpen(false)}>Понятно</Button></div></Modal>
  </>;
}
