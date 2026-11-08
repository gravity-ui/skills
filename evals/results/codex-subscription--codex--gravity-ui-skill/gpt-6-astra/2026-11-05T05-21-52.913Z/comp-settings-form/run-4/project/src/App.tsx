import {useEffect, useRef, useState} from 'react';
import {Avatar, Button, Checkbox, Icon, Modal, Select, Switch, Text, TextInput, useFileInput} from '@gravity-ui/uikit';
import {AsideHeader} from '@gravity-ui/navigation';
import {ArrowUpFromLine, Bell, Camera, Check, ChevronRight, CircleCheck, CircleInfo, CircleQuestion, Envelope, Globe, Person, ShieldCheck, Xmark} from '@gravity-ui/icons';
import './styles.css';

type Profile = {name: string; email: string; avatar: string; language: string; timezone: string; twoFactor: boolean; product: boolean; alerts: boolean; digest: boolean};
const initialProfile: Profile = {name: 'Александр Морозов', email: 'alex.morozov@gmail.com', avatar: '', language: 'ru', timezone: 'Europe/Moscow', twoFactor: false, product: true, alerts: true, digest: false};
const storageKey = 'orbit-profile-v1';
const languages = [{value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'}, {value: 'de', content: 'Deutsch'}, {value: 'es', content: 'Español'}, {value: 'fr', content: 'Français'}];
const timezones = [
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Europe/London', content: 'Лондон — Europe/London'},
  {value: 'Europe/Berlin', content: 'Берлин — Europe/Berlin'},
  {value: 'America/New_York', content: 'Нью-Йорк — America/New_York'},
  {value: 'Asia/Almaty', content: '(UTC+05:00) Алматы'},
  {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
];
function readProfile(): Profile {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || typeof saved !== 'object') return initialProfile;
    const profile = {...initialProfile};
    for (const key of Object.keys(initialProfile) as (keyof Profile)[]) {
      if (typeof saved[key] === typeof initialProfile[key]) Object.assign(profile, {[key]: saved[key]});
    }
    if (!languages.some((item) => item.value === profile.language)) profile.language = 'ru';
    if (!timezones.some((item) => item.value === profile.timezone)) profile.timezone = 'Europe/Moscow';
    return profile;
  } catch { return initialProfile; }
}
function OrbitMark() {
  return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><ellipse cx="16" cy="16" rx="6" ry="13" transform="rotate(43 16 16)" stroke="currentColor" strokeWidth="2.6"/><ellipse cx="16" cy="16" rx="6" ry="13" transform="rotate(-43 16 16)" stroke="currentColor" strokeWidth="2.6"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>;
}
function ProfileAvatar({profile, size = 'm'}: {profile: Profile; size?: 's' | 'm' | 'xl'}) {
  return profile.avatar ? <Avatar size={size} imgUrl={profile.avatar} alt={profile.name} className="profile-avatar"/> : <Avatar size={size} text={profile.name || 'Профиль'} theme="brand" className="profile-avatar"/>;
}

export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [errors, setErrors] = useState<{name?: string; email?: string; avatar?: string}>({});
  const [notice, setNotice] = useState<{text: string; error?: boolean} | null>(null);
  const [readingAvatar, setReadingAvatar] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760);
  const avatarReadId = useRef(0);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 759px)');
    const update = () => setNarrow(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault();};
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((previous) => ({...previous, [key]: value}));
    setErrors((previous) => ({...previous, [key]: undefined}));
    setNotice(null);
  }
  const {controlProps, triggerProps} = useFileInput({onUpdate: (files) => {
    const file = files[0];
    if (!file) return;
    const readId = ++avatarReadId.current;
    setReadingAvatar(false);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((previous) => ({...previous, avatar: 'Выберите изображение JPG, PNG или WebP.'})); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({...previous, avatar: 'Размер изображения не должен превышать 5 МБ.'})); return;
    }
    setReadingAvatar(true);
    setErrors((previous) => ({...previous, avatar: undefined}));
    const reader = new FileReader();
    const fail = () => {
      if (readId !== avatarReadId.current) return;
      setReadingAvatar(false);
      setErrors((previous) => ({...previous, avatar: 'Не удалось открыть изображение. Попробуйте другой файл.'}));
    };
    reader.onerror = fail;
    reader.onload = () => {
      const image = new Image();
      image.onerror = fail;
      image.onload = () => {
        if (readId !== avatarReadId.current) return;
        // Keep a small, portable avatar so it fits safely in browser storage.
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const context = canvas.getContext('2d');
        if (!context) {fail(); return;}
        const side = Math.min(image.width, image.height);
        context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
        update('avatar', canvas.toDataURL('image/png'));
        setReadingAvatar(false);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }});
  function save(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = {
      name: profile.name.trim() ? undefined : 'Введите ваше имя.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) ? undefined : 'Введите корректный email.',
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email) {
      document.getElementById(nextErrors.name ? 'profile-name' : 'profile-email')?.focus();
      return;
    }
    const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next); setProfile(next);
      setNotice({text: 'Настройки профиля сохранены'});
    } catch {setNotice({text: 'Не удалось сохранить настройки. Проверьте доступ к хранилищу браузера.', error: true});}
  }
  function cancel() {
    avatarReadId.current++;
    setReadingAvatar(false); setProfile({...saved}); setErrors({});
    setNotice({text: 'Изменения отменены'});
  }
  function navigate(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  }

  const content = <div className="workspace">
    <header className="topbar">
      <div className="breadcrumbs"><Text color="secondary">Настройки</Text><Icon data={ChevronRight} size={13}/><Text>Мой профиль</Text></div>
      <div className="topbar-actions"><Button view="flat" size="m" onClick={() => setHelpOpen(true)} aria-label="Помощь"><Icon data={CircleQuestion} size={19}/></Button><span className="topbar-divider"/><ProfileAvatar profile={saved} size="s"/></div>
    </header>
    <main className="main-content">
      <div className="page-heading"><div><div className="eyebrow">ВАШ ЛИЧНЫЙ ПРОФИЛЬ</div><Text as="h1" variant="display-1">Настройки профиля</Text><Text as="p" variant="body-2" color="secondary">Управляйте личными данными и настройте всё под себя.</Text></div><div className="account-badge"><span/>Личный аккаунт</div></div>
      <form onSubmit={save} noValidate>
        <section className="settings-card" id="profile" aria-labelledby="profile-title">
          <div className="card-heading"><span className="section-icon"><Icon data={Person} size={19}/></span><div><Text as="h2" variant="subheader-2" id="profile-title">Личные данные</Text><Text as="p" color="secondary">Так вас будут видеть другие участники.</Text></div></div>
          <div className="avatar-row"><div className="avatar-wrap"><ProfileAvatar profile={profile} size="xl"/><span className="avatar-camera"><Icon data={Camera} size={14}/></span></div><div className="avatar-details"><div className="avatar-buttons"><Button {...triggerProps} size="m" view="outlined" loading={readingAvatar}><Icon data={ArrowUpFromLine} size={15}/>Загрузить фото</Button>{profile.avatar && <Button size="m" view="flat-secondary" onClick={() => update('avatar', '')}>Удалить</Button>}</div><Text as="p" color="secondary" variant="caption-2">JPG, PNG или WebP. Максимум 5 МБ.</Text>{errors.avatar && <Text as="p" color="danger" role="alert">{errors.avatar}</Text>}</div><input {...controlProps} accept="image/jpeg,image/png,image/webp"/></div>
          <div className="fields-grid">
            <div className="field"><Text as="label" htmlFor="profile-name" variant="body-2">Имя</Text><TextInput id="profile-name" size="l" value={profile.name} onUpdate={(v) => update('name', v)} placeholder="Введите ваше имя" autoComplete="name" validationState={errors.name ? 'invalid' : undefined} errorMessage={errors.name}/></div>
            <div className="field"><Text as="label" htmlFor="profile-email" variant="body-2">Email</Text><TextInput id="profile-email" size="l" type="email" value={profile.email} onUpdate={(v) => update('email', v)} placeholder="you@example.com" autoComplete="email" startContent={<Icon data={Envelope} size={16}/>} validationState={errors.email ? 'invalid' : undefined} errorMessage={errors.email}/><Text color="secondary" variant="caption-2">Для входа в аккаунт и важных уведомлений.</Text></div>
          </div>
          <div className="preferences" id="preferences"><div className="fields-grid">
            <div className="field"><Text as="label" id="language-label" variant="body-2">Язык интерфейса</Text><Select size="l" width="max" aria-labelledby="language-label" options={languages} value={[profile.language]} onUpdate={([v]) => update('language', v)}/></div>
            <div className="field"><Text as="label" id="timezone-label" variant="body-2">Часовой пояс</Text><Select size="l" width="max" aria-labelledby="timezone-label" options={timezones} filterable filterPlaceholder="Найти часовой пояс" value={[profile.timezone]} onUpdate={([v]) => update('timezone', v)}/></div>
          </div><div className="field-note"><Icon data={Globe} size={14}/><Text variant="caption-2" color="secondary">Ваши предпочтения для комфортной работы, где бы вы ни находились.</Text></div></div>
        </section>
        <section className="settings-card security-card" id="security" aria-labelledby="security-title"><div className="card-heading"><span className="section-icon"><Icon data={ShieldCheck} size={19}/></span><div><Text as="h2" variant="subheader-2" id="security-title">Безопасность</Text><Text as="p" color="secondary">Позаботьтесь о дополнительной защите аккаунта.</Text></div></div><div className="security-setting"><div><div className="setting-title"><Text variant="body-2">Двухфакторная авторизация</Text><span className={`status-badge ${profile.twoFactor ? 'enabled' : ''}`}>{profile.twoFactor ? 'Включена' : 'Не включена'}</span></div><Text as="p" color="secondary">Дополнительное подтверждение при входе в аккаунт.</Text></div><Switch size="m" checked={profile.twoFactor} onUpdate={(v) => update('twoFactor', v)} controlProps={{'aria-label': 'Двухфакторная авторизация'}}/></div></section>
        <section className="settings-card notifications-card" id="notifications" aria-labelledby="notifications-title"><div className="card-heading"><span className="section-icon"><Icon data={Bell} size={19}/></span><div><Text as="h2" variant="subheader-2" id="notifications-title">Email-уведомления</Text><Text as="p" color="secondary">Выберите, какие письма вы хотите получать.</Text></div><span className="mail-decoration"><Icon data={Envelope} size={22}/></span></div><div className="notification-options">{([
          ['product', 'Новости продукта', 'Новые возможности, обновления и полезные советы.'],
          ['alerts', 'Системные алерты', 'Важные события и информация о безопасности аккаунта.'],
          ['digest', 'Дайджест за неделю', 'Всё самое важное за неделю в одном письме.'],
        ] as const).map(([key, title, description]) => <div className="notification-option" key={key}><Checkbox size="l" checked={profile[key]} onUpdate={(v) => update(key, v)}><span className="checkbox-content"><Text variant="body-2">{title}</Text><Text variant="body-1" color="secondary">{description}</Text></span></Checkbox></div>)}</div></section>
        <div className="form-footer"><div className="save-hint"><Icon data={dirty ? CircleInfo : Check} size={16}/><Text variant="body-1" color="secondary">{dirty ? 'Есть несохранённые изменения' : 'Всё готово для ваших изменений'}</Text></div><div className="form-actions"><Button size="l" view="outlined" onClick={cancel}>Отмена</Button><Button size="l" view="action" type="submit" disabled={readingAvatar}><Icon data={Check} size={16}/>Сохранить</Button></div></div>
      </form>
      <div className="privacy-note"><Icon data={ShieldCheck} size={14}/><Text variant="caption-2" color="secondary">Ваши данные — под вашим контролем.</Text></div>
    </main>
  </div>;

  return <>
    <AsideHeader className="app-shell" compact={narrow} onChangeCompact={setNarrow} hideCollapseButton hideSectionDividers logo={{text: 'orbit', icon: OrbitMark, iconSize: 32, textSize: 28, className: 'brand-logo', href: '#profile'}} aboveMenuContent={!narrow && <div className="navigation-label">НАСТРОЙКИ АККАУНТА</div>} menuItems={[
      {id: 'profile', title: 'Мой профиль', icon: Person, current: activeSection === 'profile', onItemClick: () => navigate('profile')},
      {id: 'security', title: 'Безопасность', icon: ShieldCheck, current: activeSection === 'security', onItemClick: () => navigate('security')},
      {id: 'notifications', title: 'Уведомления', icon: Bell, current: activeSection === 'notifications', onItemClick: () => navigate('notifications')},
      {id: 'preferences', title: 'Язык и регион', icon: Globe, current: activeSection === 'preferences', onItemClick: () => navigate('preferences')},
    ]} renderFooter={() => <div className="sidebar-bottom">{!narrow && <div className="help-card"><span className="help-icon"><Icon data={CircleQuestion} size={21}/></span><Text as="p" variant="subheader-1">Нужна помощь?</Text><Text as="p" color="secondary">Мы рядом, если у вас<br/>возникнут вопросы.</Text><Button view="flat" className="help-button" onClick={() => setHelpOpen(true)}>Центр помощи<Icon data={ChevronRight} size={13}/></Button></div>}<div className="sidebar-account"><ProfileAvatar profile={saved} size="s"/>{!narrow && <div className="sidebar-account-copy"><Text ellipsis variant="body-2">{saved.name}</Text><Text ellipsis color="secondary" variant="caption-2">Личный аккаунт</Text></div>}</div></div>} renderContent={() => content}/>
    {notice && <div className={`toast ${notice.error ? 'toast-error' : ''}`} role={notice.error ? 'alert' : 'status'}><Icon data={notice.error ? CircleInfo : CircleCheck} size={20}/><Text>{notice.text}</Text><Button view="flat" size="s" aria-label="Закрыть уведомление" onClick={() => setNotice(null)}><Icon data={Xmark} size={14}/></Button></div>}
    <Modal open={helpOpen} onOpenChange={setHelpOpen} aria-labelledby="help-title"><div className="help-modal"><div className="modal-heading"><Text as="h2" id="help-title" variant="header-1">Настройки без сложностей</Text><Button view="flat" aria-label="Закрыть" onClick={() => setHelpOpen(false)}><Icon data={Xmark}/></Button></div><Text as="p" variant="body-2">Измените нужные поля и нажмите «Сохранить». Кнопка «Отмена» вернёт последние сохранённые значения.</Text><Text as="p" variant="body-2">Для аватара подойдёт изображение JPG, PNG или WebP до 5 МБ. Фото автоматически обрезается до квадрата.</Text><Text as="p" variant="body-2" color="secondary">В этой версии настройки сохраняются в вашем браузере. Язык интерфейса и двухфакторная авторизация сохраняются как предпочтения; их применение требует подключения сервера.</Text><Button view="action" size="l" onClick={() => setHelpOpen(false)}>Понятно</Button></div></Modal>
  </>;
}
