import {useEffect, useRef, useState, type FormEvent, type ReactNode} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Alert, Avatar, Button, Checkbox, configure, Icon, Modal, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowRight, ArrowUpFromSquare, Bell, BookOpen, Camera, Check, ChevronRight, CircleInfo, CircleQuestion, Envelope, Globe, Person, ShieldCheck, Xmark} from '@gravity-ui/icons';
import './styles.css';

configure({lang: 'ru'});

type Profile = {
  name: string; email: string; avatar: string; language: string; timezone: string;
  twoFactor: boolean; news: boolean; alerts: boolean; digest: boolean;
};
const initialProfile: Profile = {
  name: 'Анна Смирнова', email: 'anna.smirnova@gmail.com', avatar: '/avatar.jpg',
  language: 'ru', timezone: 'Europe/Moscow', twoFactor: false,
  news: true, alerts: true, digest: false,
};
const storageKey = 'orbit-profile-settings-v1';
function readProfile(): Profile {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!value) return initialProfile;
    return Object.fromEntries(Object.entries(initialProfile).map(([key, fallback]) =>
      [key, typeof value[key] === typeof fallback ? value[key] : fallback])) as Profile;
  } catch { return initialProfile; }
}
const languageOptions = [
  {value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'},
  {value: 'de', content: 'Deutsch'}, {value: 'es', content: 'Español'},
  {value: 'fr', content: 'Français'},
];
const timezones = [
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'Europe/London', content: 'Лондон · Europe/London'},
  {value: 'Europe/Berlin', content: 'Берлин · Europe/Berlin'},
  {value: 'America/New_York', content: 'Нью-Йорк · America/New_York'},
  {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
  {value: 'UTC', content: '(UTC+00:00) Всемирное время'},
];
const sections = [
  {id: 'profile', title: 'Мой профиль', icon: Person},
  {id: 'preferences', title: 'Язык и регион', icon: Globe},
  {id: 'security', title: 'Безопасность', icon: ShieldCheck},
  {id: 'notifications', title: 'Уведомления', icon: Bell},
];

function OrbitMark() {
  return <svg viewBox="0 0 32 32" width="32" height="32" fill="currentColor" aria-hidden="true"><path d="M16 14C4-3-4 8 14 16-3 28 8 36 16 18c12 17 20 6 2-2C35 4 24-4 16 14Z"/></svg>;
}
function SectionHeading({icon, title, description}: {icon: typeof Person; title: string; description: string}) {
  return <div className="section-heading"><span className="section-symbol"><Icon data={icon} size={19}/></span><div><Text as="h2" variant="subheader-3">{title}</Text><Text as="p" variant="body-1" color="secondary">{description}</Text></div></div>;
}
function Field({label, htmlFor, children, hint}: {label: string; htmlFor: string; children: ReactNode; hint?: string}) {
  return <div className="field"><label htmlFor={htmlFor}>{label}</label>{children}{hint && <Text as="p" variant="caption-2" color="secondary">{hint}</Text>}</div>;
}

export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [compact, setCompact] = useState(() => window.innerWidth < 900);
  const [activeSection, setActiveSection] = useState('profile');
  const [notice, setNotice] = useState<{type: 'success' | 'danger' | 'info'; text: string} | null>(null);
  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [help, setHelp] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 899px)');
    const onResize = () => setCompact(media.matches);
    media.addEventListener('change', onResize);
    return () => { media.removeEventListener('change', onResize); clearTimeout(saveTimer.current); };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = '';};
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(previous => ({...previous, [key]: value}));
    setNotice(null);
    if (key === 'name' || key === 'email') setErrors(previous => ({...previous, [key]: undefined}));
  }
  function navigate(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
  }
  function uploadAvatar() {
    // UIKit has no file input. The accessible UIKit button opens a native file picker.
    const picker = document.createElement('input');
    picker.type = 'file'; picker.accept = 'image/jpeg,image/png,image/webp';
    picker.onchange = () => {
      const file = picker.files?.[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setNotice({type: 'danger', text: 'Выберите изображение в формате JPG, PNG или WebP.'}); return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setNotice({type: 'danger', text: 'Изображение слишком большое. Максимальный размер — 2 МБ.'}); return;
      }
      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {update('avatar', reader.result as string); setUploading(false);};
        image.onerror = () => {setUploading(false); setNotice({type: 'danger', text: 'Не удалось прочитать изображение. Попробуйте другой файл.'});};
        image.src = reader.result as string;
      };
      reader.onerror = () => {setUploading(false); setNotice({type: 'danger', text: 'Не удалось загрузить файл. Попробуйте ещё раз.'});};
      reader.readAsDataURL(file);
    };
    picker.click();
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!profile.name.trim()) nextErrors.name = 'Укажите ваше имя';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) nextErrors.email = 'Введите корректный email';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {navigate('profile'); return;}
    setSaving(true); setNotice(null);
    saveTimer.current = setTimeout(() => {
      const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        setSaved(next); setProfile(next);
        setNotice({type: 'success', text: 'Настройки профиля сохранены в этом браузере.'});
      } catch {setNotice({type: 'danger', text: 'Не удалось сохранить настройки. Проверьте свободное место и доступ к хранилищу браузера.'});}
      setSaving(false);
    }, 450);
  }
  function cancel() {
    setProfile({...saved}); setErrors({});
    setNotice({type: 'info', text: 'Изменения отменены. Восстановлены сохранённые настройки.'});
  }
  function avatar(size: 's' | 'm' | 'xl', source = profile) {
    return source.avatar
      ? <Avatar size={size} imgUrl={source.avatar} alt={source.name} className="profile-avatar"/>
      : <Avatar size={size} text={source.name || 'Ваш профиль'} theme="brand" className="profile-avatar"/>;
  }

  return <AsideHeader
    className="app-shell" compact={compact} onChangeCompact={setCompact} hideCollapseButton hideSectionDividers
    logo={{text: 'orbit', wrapper: () => <div className={`brand ${compact ? 'brand-compact' : ''}`}><span className="brand-mark"><OrbitMark/></span>{!compact && <span>orbit<span className="brand-period">.</span></span>}</div>}}
    aboveMenuContent={!compact ? <div className="nav-heading"><Text variant="caption-2" color="secondary">ЛИЧНОЕ ПРОСТРАНСТВО</Text><Text as="p" variant="body-1">Настройки аккаунта</Text></div> : <div className="compact-spacer"/>}
    menuItems={sections.map(section => ({...section, current: activeSection === section.id, onItemClick: () => navigate(section.id), className: 'settings-nav-item'}))}
    renderFooter={() => <div className="nav-footer">{!compact && <div className="privacy-card"><span className="privacy-icon"><Icon data={ShieldCheck} size={22}/></span><Text as="p" variant="subheader-1">Ваше пространство.<br/>Ваши правила.</Text><Text as="p" variant="body-1" color="secondary">Настройте Orbit так, как удобно именно вам.</Text><span className="privacy-orbit" aria-hidden="true"/></div>}<Button view="flat" size="l" width="max" onClick={() => setHelp(true)} aria-label="Помощь и поддержка"><Icon data={CircleQuestion} size={18}/>{!compact && 'Помощь и поддержка'}</Button>{!compact && <Text as="p" variant="caption-2" color="hint" className="copyright">© 2026 Orbit</Text>}</div>}
    renderContent={() => <div className="page-shell">
      <header className="topbar"><div className="breadcrumbs"><span className="breadcrumb-parent">Настройки</span><Icon data={ChevronRight} size={13}/><span>Профиль</span></div><div className="topbar-account"><span className="workspace-label"><span className="workspace-dot"/>Личный аккаунт</span><span className="topbar-divider"/>{avatar('s', saved)}<span className="account-name">{saved.name.split(' ')[0]}</span></div></header>
      <main className="page-content">
        <div className="page-heading"><div><div className="eyebrow">ВАШ АККАУНТ</div><Text as="h1" variant="display-1">Настройки профиля</Text><Text as="p" variant="body-2" color="secondary">Немного о вас — и о том, как вам удобно работать.</Text></div><span className="heading-decoration" aria-hidden="true"><Icon data={Person} size={25}/></span></div>
        <div className="content-grid"><form onSubmit={save} noValidate className="settings-form">
          <section className="settings-card" id="profile">
            <SectionHeading icon={Person} title="Личные данные" description="Так вас будут видеть другие участники пространства."/>
            <div className="avatar-row"><div className="avatar-with-camera">{avatar('xl')}<span className="camera-badge"><Icon data={Camera} size={13}/></span></div><div className="avatar-actions"><div className="avatar-buttons"><Button view="outlined" size="m" onClick={uploadAvatar} loading={uploading} disabled={saving}><Icon data={ArrowUpFromSquare} size={15}/>Загрузить фото</Button><Button view="flat-secondary" size="m" disabled={!profile.avatar || saving || uploading} onClick={() => update('avatar', '')}>Удалить</Button></div><Text as="p" variant="caption-2" color="secondary">JPG, PNG или WebP. Не больше 2 МБ.</Text></div></div>
            <div className="fields-grid"><Field label="Имя" htmlFor="profile-name"><TextInput id="profile-name" size="l" value={profile.name} onUpdate={value => update('name', value)} placeholder="Ваше имя" disabled={saving} validationState={errors.name ? 'invalid' : undefined} errorMessage={errors.name} controlProps={{autoComplete: 'name', maxLength: 80}}/></Field><Field label="Email" htmlFor="profile-email"><TextInput id="profile-email" size="l" type="email" value={profile.email} onUpdate={value => update('email', value)} placeholder="you@example.com" disabled={saving} validationState={errors.email ? 'invalid' : undefined} errorMessage={errors.email} startContent={<span className="input-icon"><Icon data={Envelope} size={16}/></span>} controlProps={{autoComplete: 'email', maxLength: 254}}/></Field></div>
          </section>
          <section className="settings-card" id="preferences">
            <SectionHeading icon={Globe} title="Язык и регион" description="Знакомый язык и правильное время — всё на своих местах."/>
            <div className="fields-grid"><Field label="Язык интерфейса" htmlFor="profile-language"><Select id="profile-language" size="l" width="max" options={languageOptions} value={[profile.language]} onUpdate={value => update('language', value[0])} disabled={saving} aria-label="Язык интерфейса"/></Field><Field label="Часовой пояс" htmlFor="profile-timezone"><Select id="profile-timezone" size="l" width="max" options={timezones} value={[profile.timezone]} onUpdate={value => update('timezone', value[0])} filterable filterPlaceholder="Найти город или часовой пояс" disabled={saving} aria-label="Часовой пояс"/></Field></div>
            <div className="section-note"><Icon data={CircleInfo} size={14}/><Text variant="caption-2" color="secondary">Часовой пояс используется для уведомлений и истории активности.</Text></div>
          </section>
          <section className="settings-card" id="security">
            <SectionHeading icon={ShieldCheck} title="Безопасность" description="Дополнительная защита для вашего спокойствия."/>
            <div className="security-setting"><div><div className="security-title"><Text variant="body-2">Двухфакторная авторизация</Text><span className={`status-pill ${profile.twoFactor ? 'status-on' : ''}`}>{profile.twoFactor ? 'Включена' : 'Выключена'}</span></div><Text as="p" variant="body-1" color="secondary">Дополнительная проверка при входе в аккаунт.</Text></div><Switch size="l" checked={profile.twoFactor} onUpdate={value => update('twoFactor', value)} disabled={saving} controlProps={{'aria-label': 'Двухфакторная авторизация'}}/></div>
          </section>
          <section className="settings-card" id="notifications">
            <SectionHeading icon={Bell} title="Email-уведомления" description="Только то, что важно. Выберите, о чём нам писать."/>
            <div className="notification-options">{([
              ['news', 'Новости продукта', 'Новые возможности, обновления и полезные советы.'],
              ['alerts', 'Системные алерты', 'Важные события и изменения в вашем аккаунте.'],
              ['digest', 'Дайджест за неделю', 'Главные события вашего пространства в одном письме.'],
            ] as const).map(([key, title, description]) => <Checkbox key={key} size="l" checked={profile[key]} onUpdate={value => update(key, value)} disabled={saving}><span className="checkbox-copy"><span className="checkbox-title">{title}</span><span className="checkbox-description">{description}</span></span></Checkbox>)}</div>
          </section>
          {notice && <div role={notice.type === 'danger' ? 'alert' : 'status'}><Alert theme={notice.type} message={notice.text} onClose={() => setNotice(null)}/></div>}
          <div className="form-footer"><span className={`save-indicator ${dirty ? 'has-changes' : ''}`}><Icon data={dirty ? CircleInfo : Check} size={15}/>{dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}</span><div className="footer-actions"><Button view="normal" size="l" disabled={saving || uploading} onClick={cancel}>Отмена</Button><Button view="action" size="l" type="submit" loading={saving} disabled={uploading} className="save-button">Сохранить<Icon data={Check} size={16}/></Button></div></div>
          <div className="form-bottom-note"><Icon data={ShieldCheck} size={13}/><Text variant="caption-2" color="hint">Вы управляете своими данными и настройками.</Text></div>
        </form>
        <div className="right-rail"><div className="profile-preview"><div className="preview-cover"><span/><span/><span/></div><div className="preview-avatar">{avatar('xl')}</div><Text as="p" variant="subheader-3" className="preview-name">{profile.name.trim() || 'Ваше имя'}</Text><Text as="p" variant="body-1" color="secondary" className="preview-email">{profile.email.trim() || 'Ваш email'}</Text><span className="member-label"><span/>Личный аккаунт</span><div className="preview-divider"/><div className="preview-detail"><Icon data={Globe} size={15}/><span>{languageOptions.find(option => option.value === profile.language)?.content}</span></div><div className="preview-detail"><Icon data={ShieldCheck} size={15}/><span>{profile.twoFactor ? 'Дополнительная защита включена' : 'Базовая защита аккаунта'}</span></div><div className="preview-footnote"><span className="live-dot"/>Предпросмотр профиля</div></div>
          <div className="tip-card"><span className="tip-icon"><Icon data={CircleInfo} size={18}/></span><Text as="h3" variant="subheader-1">Здесь всё о вас</Text><Text as="p" variant="body-1" color="secondary">Поддерживайте данные профиля в актуальном состоянии, чтобы оставаться на связи.</Text><Button view="flat-action" size="m" onClick={() => setHelp(true)}>О настройках профиля<Icon data={ArrowRight} size={14}/></Button></div>
          <div className="rail-security"><Icon data={ShieldCheck} size={16}/><Text variant="caption-2" color="secondary">Ваши данные в надёжных руках</Text></div>
        </div></div>
      </main>
      <Modal open={help} onOpenChange={setHelp} aria-labelledby="help-title"><div className="help-modal"><div className="help-heading"><span className="section-symbol"><Icon data={BookOpen} size={22}/></span><Button view="flat" onClick={() => setHelp(false)} aria-label="Закрыть"><Icon data={Xmark} size={18}/></Button></div><Text as="h2" id="help-title" variant="header-1">Настройте своё пространство</Text><Text as="p" variant="body-2" color="secondary">В профиле можно изменить личные данные, загрузить фото, выбрать язык и часовой пояс, а также настроить уведомления.</Text><Text as="p" variant="body-2" color="secondary">Нажмите «Сохранить», чтобы сохранить настройки в этом браузере. «Отмена» вернёт последние сохранённые значения. Настройки языка и двухфакторной авторизации сохраняются как предпочтения; подключение к сервису авторизации не настроено.</Text><Button view="action" size="l" width="max" onClick={() => setHelp(false)}>Всё понятно</Button></div></Modal>
    </div>}
  />;
}
