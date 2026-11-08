import {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {Avatar, Button, Checkbox, Icon, Select, Switch, Text, TextInput, useFileInput} from '@gravity-ui/uikit';
import {ArrowUpFromLine, Camera, Check, ChevronDown, CircleCheck, CircleInfo, CircleQuestion, Envelope, Globe, Lock, Person, ShieldCheck, Xmark} from '@gravity-ui/icons';
import './styles.css';

type Profile = {
  name: string;
  email: string;
  avatar: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
};
const initialProfile: Profile = {
  name: 'Александр Смирнов', email: 'alex.smirnov@gmail.com', avatar: '',
  language: 'ru', timezone: 'Europe/Moscow', twoFactor: false,
  productNews: true, systemAlerts: true, weeklyDigest: false,
};
const storageKey = 'forma.profile.v1';
const sections = [
  {id: 'profile', label: 'Мой профиль', icon: Person},
  {id: 'preferences', label: 'Язык и регион', icon: Globe},
  {id: 'security', label: 'Безопасность', icon: ShieldCheck},
  {id: 'notifications', label: 'Уведомления', icon: Envelope},
];
const languages = [{value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'}, {value: 'de', content: 'Deutsch'}, {value: 'fr', content: 'Français'}, {value: 'es', content: 'Español'}];
const timezones = [
  {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
  {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
  {value: 'Europe/Samara', content: '(UTC+04:00) Самара'},
  {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
  {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
  {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
  {value: 'UTC', content: '(UTC+00:00) Всемирное время'},
  {value: 'Europe/London', content: 'Лондон — Europe/London'},
  {value: 'Europe/Berlin', content: 'Берлин — Europe/Berlin'},
  {value: 'America/New_York', content: 'Нью-Йорк — America/New_York'},
  {value: 'Asia/Dubai', content: '(UTC+04:00) Дубай'},
];
function readProfile(): Profile {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!saved || typeof saved !== 'object') return initialProfile;
    const result = {...initialProfile};
    for (const key of Object.keys(initialProfile) as (keyof Profile)[]) {
      if (typeof saved[key] === typeof initialProfile[key]) Object.assign(result, {[key]: saved[key]});
    }
    if (!languages.some(({value}) => value === result.language)) result.language = initialProfile.language;
    if (!timezones.some(({value}) => value === result.timezone)) result.timezone = initialProfile.timezone;
    if (result.avatar && !/^data:image\/(png|jpeg|webp);base64,/.test(result.avatar)) result.avatar = '';
    return result;
  } catch { return initialProfile; }
}
function SectionHeading({title, description, number}: {title: string; description: string; number: string}) {
  return <div className="section-heading"><div><Text as="h2" variant="subheader-3">{title}</Text><Text as="p" variant="body-1" color="secondary">{description}</Text></div><span className="section-number">{number}</span></div>;
}

export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [profile, setProfile] = useState<Profile>(saved);
  const [activeSection, setActiveSection] = useState('profile');
  const [submitted, setSubmitted] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{text: string; error?: boolean} | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const uploadGeneration = useRef(0);
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const nameError = !profile.name.trim() ? 'Введите ваше имя' : profile.name.length > 100 ? 'Не более 100 символов' : '';
  const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) ? 'Введите корректный email' : '';
  const initials = saved.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'А';
  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({...current, [key]: value}));
    setNotice(null);
  }
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => { if (dirty) {event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, {rootMargin: '-100px 0px -45% 0px', threshold: 0});
    sections.forEach(({id}) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  async function uploadAvatar(files: File[]) {
    const file = files[0];
    if (!file) return;
    setUploadError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Выберите изображение в формате JPG, PNG или WebP.'); return;
    }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Размер файла не должен превышать 5 МБ.'); return; }
    const generation = ++uploadGeneration.current;
    setUploading(true);
    try {
      const image = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      const side = Math.min(image.width, image.height);
      context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 256, 256);
      image.close();
      if (generation === uploadGeneration.current) update('avatar', canvas.toDataURL('image/png'));
    } catch { if (generation === uploadGeneration.current) setUploadError('Не удалось открыть изображение. Попробуйте другой файл.'); }
    finally { if (generation === uploadGeneration.current) setUploading(false); }
  }
  const {controlProps, triggerProps} = useFileInput({onUpdate: uploadAvatar});
  function save(event: FormEvent) {
    event.preventDefault(); setSubmitted(true); setNotice(null);
    if (nameError || emailError) {
      document.getElementById(nameError ? 'name' : 'email')?.focus(); return;
    }
    const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next); setProfile(next); setSubmitted(false);
      setNotice({text: 'Настройки профиля сохранены'});
    } catch { setNotice({text: 'Не удалось сохранить настройки. Проверьте доступ к хранилищу браузера.', error: true}); }
  }
  function cancel() {
    uploadGeneration.current++; setUploading(false); setProfile({...saved});
    setSubmitted(false); setUploadError(''); setNotice({text: 'Изменения отменены'});
  }
  const avatar = (size: 's' | 'xl', current = false) => {
    const source = current ? profile : saved;
    return source.avatar ? <Avatar size={size} imgUrl={source.avatar} alt="Фото профиля" /> : <Avatar size={size} text={initials} className="profile-avatar" />;
  };
  return <div className="app">
    <header className="masthead">
      <div className="masthead-inner">
        <a className="brand" href="#" aria-label="Forma — настройки профиля"><span className="brand-symbol" aria-hidden="true"><i/><i/><i/><i/></span><span>forma<span className="brand-dot">.</span></span></a>
        <div className="header-divider"/>
        <Text variant="body-1" color="secondary" className="workspace-label">Личное пространство</Text>
        <div className="header-account"><span className="private-badge"><Icon data={Lock} size={12}/> Личный аккаунт</span>{avatar('s')}<span className="header-name">{saved.name.trim().split(/\s+/)[0]}</span></div>
      </div>
    </header>
    <main className="page">
      <div className="page-heading"><div><div className="eyebrow">ВАШЕ ПРОСТРАНСТВО</div><Text as="h1" variant="display-1">Настройки профиля</Text><Text as="p" variant="body-2" color="secondary">Всё, что делает ваше пространство по-настоящему вашим.</Text></div><span className="page-heading-mark" aria-hidden="true"><Icon data={Person} size={25}/></span></div>
      <div className="settings-layout">
        <div className="settings-sidebar">
          <div className="sidebar-label">НАСТРОЙКИ АККАУНТА</div>
          <nav className="section-nav" aria-label="Разделы настроек">
            {sections.map(({id, label, icon}) => <a key={id} href={`#${id}`} onClick={() => setActiveSection(id)} className={`section-link ${activeSection === id ? 'active' : ''}`} aria-current={activeSection === id ? 'location' : undefined}><Icon data={icon} size={18}/><span>{label}</span>{activeSection === id && <span className="nav-dot"/>}</a>)}
          </nav>
          <div className="sidebar-help"><span className="help-icon"><Icon data={CircleQuestion} size={20}/></span><Text as="p" variant="subheader-1">Всё под вашим контролем</Text><Text as="p" variant="body-1" color="secondary">Управляйте личными данными и выбирайте, как оставаться на связи.</Text><Button view="flat" size="s" onClick={() => setShowHelp(!showHelp)} aria-expanded={showHelp} className="help-button">{showHelp ? 'Скрыть подсказку' : 'Нужна помощь?'}<Icon data={showHelp ? ChevronDown : CircleQuestion} size={14}/></Button>{showHelp && <Text as="p" variant="body-1" color="secondary" className="help-answer">Измените нужные поля и нажмите «Сохранить». Кнопка «Отмена» вернёт последние сохранённые настройки. Фото можно заменить или удалить.</Text>}</div>
          <div className="sidebar-privacy"><Icon data={ShieldCheck} size={14}/><span>Ваши данные — только ваши</span></div>
        </div>
        <form className="settings-form" onSubmit={save} noValidate>
          <div className="form-card">
            <section id="profile" className="form-section">
              <SectionHeading title="Личные данные" description="Познакомимся поближе. Так вас будут видеть другие." number="01"/>
              <div className="avatar-row"><div className="avatar-wrap">{avatar('xl', true)}<span className="avatar-camera" aria-hidden="true"><Icon data={Camera} size={13}/></span></div><div className="avatar-details"><Text as="p" variant="subheader-1">Фото профиля</Text><div className="avatar-actions"><input {...controlProps} accept="image/jpeg,image/png,image/webp" aria-label="Загрузить фото профиля"/><Button {...triggerProps} type="button" size="m" view="outlined" loading={uploading}><Icon data={ArrowUpFromLine} size={14}/>{profile.avatar ? 'Изменить фото' : 'Загрузить фото'}</Button>{profile.avatar && <Button type="button" size="s" view="flat-secondary" onClick={() => {uploadGeneration.current++; setUploading(false); update('avatar', ''); setUploadError('');}}>Удалить</Button>}<Text variant="caption-2" color="secondary">JPG, PNG или WebP. До 5 МБ.</Text></div>{uploadError && <p className="field-error" role="alert">{uploadError}</p>}</div></div>
              <div className="field-grid"><div className="field"><label htmlFor="name">Имя</label><TextInput id="name" name="name" size="l" value={profile.name} onUpdate={(value) => update('name', value)} autoComplete="name" placeholder="Как вас зовут?" validationState={submitted && nameError ? 'invalid' : undefined} errorMessage={submitted ? nameError : undefined} controlProps={{maxLength: 100, 'aria-required': true}}/></div><div className="field"><label htmlFor="email">Email</label><TextInput id="email" name="email" type="email" size="l" value={profile.email} onUpdate={(value) => update('email', value)} autoComplete="email" placeholder="you@example.com" startContent={<span className="input-icon"><Icon data={Envelope} size={16}/></span>} validationState={submitted && emailError ? 'invalid' : undefined} errorMessage={submitted ? emailError : undefined} controlProps={{'aria-required': true}}/></div></div>
            </section>
            <section id="preferences" className="form-section">
              <SectionHeading title="Язык и регион" description="Настройте пространство под свой ритм." number="02"/>
              <div className="field-grid"><div className="field"><label htmlFor="language">Язык интерфейса</label><Select id="language" size="l" width="max" value={[profile.language]} options={languages} onUpdate={([value]) => update('language', value)} aria-label="Язык интерфейса"/><Text variant="caption-2" color="secondary">Предпочитаемый язык интерфейса.</Text></div><div className="field"><label htmlFor="timezone">Часовой пояс</label><Select id="timezone" size="l" width="max" value={[profile.timezone]} options={timezones} onUpdate={([value]) => update('timezone', value)} filterable filterPlaceholder="Найти город или часовой пояс" aria-label="Часовой пояс"/><Text variant="caption-2" color="secondary">Для времени событий и уведомлений.</Text></div></div>
            </section>
            <section id="security" className="form-section">
              <SectionHeading title="Безопасность" description="Дополнительная защита для вашего аккаунта." number="03"/>
              <div className="security-row"><span className="security-icon"><Icon data={ShieldCheck} size={22}/></span><div className="security-copy"><Text as="p" variant="body-2" className="option-title">Двухфакторная авторизация<span className={`status-label ${profile.twoFactor ? 'enabled' : ''}`}>{profile.twoFactor ? 'Включена' : 'Выключена'}</span></Text><Text as="p" variant="body-1" color="secondary">Дополнительное подтверждение при входе в аккаунт.</Text></div><Switch size="m" checked={profile.twoFactor} onUpdate={(value) => update('twoFactor', value)} controlProps={{'aria-label': 'Двухфакторная авторизация'}}/></div>
            </section>
            <section id="notifications" className="form-section notifications-section">
              <SectionHeading title="Email-уведомления" description="Только то, что важно. Выберите, какие письма получать." number="04"/>
              <div className="notification-list">{([
                ['productNews', 'Новости продукта', 'Новые возможности, улучшения и важные обновления.'],
                ['systemAlerts', 'Системные алерты', 'Безопасность аккаунта и важные системные события.'],
                ['weeklyDigest', 'Дайджест за неделю', 'Главное за прошедшую неделю — в одном письме.'],
              ] as const).map(([key, title, description]) => <Checkbox key={key} size="l" checked={profile[key]} onUpdate={(value) => update(key, value)} className="notification-checkbox"><span className="notification-text"><span className="option-title">{title}</span><Text as="span" variant="body-1" color="secondary">{description}</Text></span></Checkbox>)}</div>
            </section>
            <div className="form-footer"><div className={`save-status ${dirty ? 'has-changes' : ''}`} aria-live="polite"><Icon data={dirty ? CircleInfo : Check} size={15}/><span>{dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}</span></div><div className="footer-actions"><Button type="button" size="l" view="outlined" onClick={cancel}>Отмена</Button><Button type="submit" size="l" view="action" disabled={uploading}><Icon data={Check} size={16}/>Сохранить</Button></div></div>
          </div>
          <div className="form-footnote"><Icon data={Lock} size={13}/><span>Личные данные хранятся бережно и не передаются третьим лицам.</span></div>
        </form>
      </div>
      <footer className="page-footer"><span>© {new Date().getFullYear()} Forma</span><span>Меньше суеты. Больше вашего.</span></footer>
    </main>
    {notice && <div className={`toast ${notice.error ? 'toast-error' : ''}`} role={notice.error ? 'alert' : 'status'}><Icon data={notice.error ? CircleQuestion : CircleCheck} size={20}/><span>{notice.text}</span><Button size="s" view="flat" onClick={() => setNotice(null)} aria-label="Закрыть уведомление"><Icon data={Xmark} size={16}/></Button></div>}
  </div>;
}
