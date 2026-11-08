import {useEffect, useRef, useState, type ChangeEvent, type FormEvent} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Avatar, Button, Checkbox, Icon, Modal, Select, Switch, Text, TextInput} from '@gravity-ui/uikit';
import {ArrowUpFromSquare, Bell, Camera, Check, ChevronRight, CircleQuestion, Envelope, Globe, Lock, Person, ShieldCheck} from '@gravity-ui/icons';
import './styles.css';

type Profile = {name: string; email: string; avatar: string; language: string; timezone: string; twoFactor: boolean; product: boolean; alerts: boolean; digest: boolean};
const STORAGE_KEY = 'orbita-profile-v1';
const initialProfile: Profile = {name: 'Александр Иванов', email: 'alex.ivanov@gmail.com', avatar: '', language: 'ru', timezone: 'Europe/Moscow', twoFactor: false, product: true, alerts: true, digest: false};
const languages = [{value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'}, {value: 'de', content: 'Deutsch'}, {value: 'es', content: 'Español'}, {value: 'fr', content: 'Français'}];
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
  {value: 'Asia/Kamchatka', content: '(UTC+12:00) Камчатка'},
  {value: 'UTC', content: '(UTC+00:00) Всемирное время'},
];
function readProfile(): Profile {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!data || typeof data !== 'object') return initialProfile;
    const result = {...initialProfile};
    for (const key of Object.keys(result) as (keyof Profile)[]) {
      if (typeof data[key] === typeof result[key]) Object.assign(result, {[key]: data[key]});
    }
    if (!languages.some(l => l.value === result.language)) result.language = 'ru';
    if (!timezones.some(t => t.value === result.timezone)) result.timezone = 'Europe/Moscow';
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(result.avatar)) result.avatar = '';
    return result;
  } catch { return initialProfile; }
}
function ProfileAvatar({profile, size = 'l'}: {profile: Profile; size?: 's' | 'm' | 'l' | 'xl'}) {
  const common = {size, className: 'profile-avatar', 'aria-label': 'Аватар пользователя'};
  return profile.avatar ? <Avatar {...common} imgUrl={profile.avatar} /> : <Avatar {...common} text={profile.name.trim() || 'Профиль'} theme="brand" />;
}
const sections = [
  {id: 'personal', title: 'Мой профиль', icon: Person},
  {id: 'preferences', title: 'Язык и время', icon: Globe},
  {id: 'security', title: 'Безопасность', icon: ShieldCheck},
  {id: 'notifications', title: 'Уведомления', icon: Bell},
];

export function App() {
  const [saved, setSaved] = useState(readProfile);
  const [profile, setProfile] = useState(saved);
  const [activeSection, setActiveSection] = useState('personal');
  const [compact, setCompact] = useState(() => window.innerWidth < 800);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadId = useRef(0);
  const dirty = JSON.stringify(saved) !== JSON.stringify(profile);
  const nameError = !profile.name.trim() ? 'Введите ваше имя' : profile.name.trim().length > 80 ? 'Не более 80 символов' : '';
  const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) ? 'Введите корректный email' : '';
  useEffect(() => {
    const media = window.matchMedia('(max-width: 799px)');
    const change = () => setCompact(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = '';};
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile(previous => ({...previous, [key]: value}));
    setNotice(''); setSaveError('');
  }
  function goTo(id: string) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  function save(event: FormEvent) {
    event.preventDefault(); setSubmitted(true);
    if (nameError || emailError) {
      document.getElementById(nameError ? 'profile-name' : 'profile-email')?.focus();
      return;
    }
    const next = {...profile, name: profile.name.trim(), email: profile.email.trim()};
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next); setProfile(next); setSubmitted(false); setSaveError('');
      setNotice('Изменения сохранены');
    } catch {setSaveError('Не удалось сохранить изменения. Проверьте доступ к хранилищу браузера или выберите фото меньшего размера.');}
  }
  function cancel() {
    uploadId.current++; setUploading(false); setProfile(saved); setSubmitted(false); setAvatarError(''); setSaveError('');
    setNotice('Изменения отменены');
  }
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setAvatarError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {setAvatarError('Выберите изображение JPG, PNG или WebP.'); return;}
    if (file.size > 5 * 1024 * 1024) {setAvatarError('Размер файла должен быть не больше 5 МБ.'); return;}
    const requestId = ++uploadId.current;
    setUploading(true);
    const reader = new FileReader();
    const fail = () => {if (requestId === uploadId.current) {setUploading(false); setAvatarError('Не удалось прочитать изображение. Выберите другой файл.');}};
    reader.onerror = fail;
    reader.onload = () => {
      const img = new Image();
      img.onerror = fail;
      img.onload = () => {
        if (requestId !== uploadId.current) return;
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, 512 / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * ratio)); canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext('2d');
        if (!ctx) {fail(); return;}
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        update('avatar', canvas.toDataURL('image/png')); setUploading(false);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }
  const content = <div className="page-shell">
    <header className="topbar">
      <div className="breadcrumbs"><span>Настройки</span><Icon data={ChevronRight} size={13}/><span className="breadcrumb-current">Мой профиль</span></div>
      <div className="topbar-actions"><Button view="flat-secondary" onClick={() => setHelpOpen(true)} aria-label="Помощь"><Icon data={CircleQuestion} size={19}/><span className="help-label">Помощь</span></Button><span className="topbar-divider"/><ProfileAvatar profile={saved} size="s"/></div>
    </header>
    <main className="page-main">
      <div className="page-heading"><div className="eyebrow">ВАШЕ ЛИЧНОЕ ПРОСТРАНСТВО</div><Text as="h1" variant="display-1">Настройки профиля</Text><Text as="p" variant="body-2" color="secondary">Управляйте личными данными и настройте всё под себя.</Text></div>
      <div className="settings-layout">
        <form onSubmit={save} noValidate className="settings-form">
          <div className="settings-card">
            <section className="form-section" id="personal">
              <div className="section-heading"><Icon data={Person} size={19}/><Text as="h2" variant="subheader-2">Личные данные</Text></div>
              <div className="avatar-row"><div className="editable-avatar"><ProfileAvatar profile={profile} size="xl"/><span className="camera-badge"><Icon data={Camera} size={13}/></span></div><div className="avatar-controls"><div className="avatar-buttons"><Button size="m" view="outlined" onClick={() => fileRef.current?.click()} loading={uploading}><Icon data={ArrowUpFromSquare} size={15}/>Загрузить фото</Button>{profile.avatar && <Button view="flat-secondary" size="s" onClick={() => {uploadId.current++; setUploading(false); update('avatar', ''); setAvatarError('');}}>Удалить</Button>}</div><Text as="p" variant="caption-2" color="secondary">JPG, PNG или WebP. Не более 5 МБ.</Text></div></div>
              {/* Native file picker is required; UIKit has no file input. The visible control is a Gravity Button. */}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} aria-label="Загрузить аватар"/>
              {avatarError && <p className="error-message" role="alert">{avatarError}</p>}
              <div className="field-grid"><div className="field"><label htmlFor="profile-name">Имя</label><TextInput id="profile-name" size="l" value={profile.name} onUpdate={v => update('name', v)} placeholder="Введите имя" autoComplete="name" validationState={submitted && nameError ? 'invalid' : undefined} errorMessage={submitted ? nameError : undefined}/></div><div className="field"><label htmlFor="profile-email">Email</label><TextInput id="profile-email" size="l" type="email" value={profile.email} onUpdate={v => update('email', v)} autoComplete="email" startContent={<Icon data={Envelope} size={16}/>} validationState={submitted && emailError ? 'invalid' : undefined} errorMessage={submitted ? emailError : undefined}/></div></div>
            </section>
            <section className="form-section" id="preferences">
              <div className="section-heading"><Icon data={Globe} size={19}/><Text as="h2" variant="subheader-2">Язык и время</Text></div>
              <div className="field-grid"><div className="field"><label id="language-label">Язык интерфейса</label><Select aria-labelledby="language-label" size="l" width="max" value={[profile.language]} options={languages} onUpdate={v => update('language', v[0])}/></div><div className="field"><label id="timezone-label">Часовой пояс</label><Select aria-labelledby="timezone-label" size="l" width="max" value={[profile.timezone]} options={timezones} filterable filterPlaceholder="Найти часовой пояс" onUpdate={v => update('timezone', v[0])}/></div></div>
              <Text as="p" variant="caption-2" color="secondary" className="section-note">Используется для отображения времени и отправки уведомлений.</Text>
            </section>
            <section className="form-section" id="security">
              <div className="section-heading"><Icon data={ShieldCheck} size={19}/><Text as="h2" variant="subheader-2">Безопасность</Text></div>
              <div className="security-row"><div><div className="security-title"><label htmlFor="two-factor">Двухфакторная авторизация</label><span className="recommend-badge">Рекомендуем</span></div><Text as="p" variant="body-1" color="secondary">Дополнительный уровень защиты вашего аккаунта.</Text></div><Switch id="two-factor" size="m" checked={profile.twoFactor} onUpdate={v => update('twoFactor', v)} controlProps={{'aria-label': 'Двухфакторная авторизация'}}/></div>
              {profile.twoFactor && <p className="section-note">Выбор сохранится в профиле. Для активации проверки при входе необходимо подключение сервиса авторизации.</p>}
            </section>
            <section className="form-section" id="notifications">
              <div className="section-heading"><Icon data={Bell} size={19}/><Text as="h2" variant="subheader-2">Email-уведомления</Text></div>
              <Text as="p" variant="body-1" color="secondary" className="notification-intro">Выберите, какие письма вы хотите получать.</Text>
              <div className="notification-options">{[
                {key: 'product' as const, title: 'Новости продукта', text: 'Новые возможности, обновления и полезные советы.'},
                {key: 'alerts' as const, title: 'Системные алерты', text: 'Важные события и изменения в вашем аккаунте.'},
                {key: 'digest' as const, title: 'Дайджест за неделю', text: 'Самое главное за неделю в одном письме.'},
              ].map(item => <Checkbox key={item.key} size="m" checked={profile[item.key]} onUpdate={v => update(item.key, v)}><span className="checkbox-content"><span>{item.title}</span><span className="checkbox-description">{item.text}</span></span></Checkbox>)}</div>
            </section>
          </div>
          {saveError && <p className="error-message" role="alert">{saveError}</p>}
          <div className="form-actions"><div className="action-buttons"><Button view="action" size="l" type="submit" disabled={uploading}>Сохранить<Icon data={Check} size={16}/></Button><Button view="outlined" size="l" type="button" onClick={cancel}>Отмена</Button></div><span className="save-hint">{dirty ? 'Есть несохранённые изменения' : 'Всё актуально'}</span></div>
          <div className="privacy-note"><Icon data={Lock} size={13}/><span>Настройки сохраняются только в этом браузере.</span></div>
        </form>
        <div className="right-column">
          <section className="profile-card" aria-label="Предпросмотр профиля"><div className="profile-cover"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><span className="orbit-dot"/><span className="cover-caption">НЕМНОГО БОЛЬШЕ О ВАС</span></div><div className="profile-preview"><div className="preview-avatar"><ProfileAvatar profile={profile} size="xl"/></div><Text as="h2" variant="subheader-3" className="preview-name">{profile.name.trim() || 'Ваше имя'}</Text><p className="preview-email">{profile.email || 'Ваш email'}</p><span className="account-badge"><span/>Личный аккаунт</span><div className="preview-divider"/><div className="preview-detail"><Icon data={Globe} size={15}/><span>{languages.find(l => l.value === profile.language)?.content}</span></div><div className="preview-detail"><Icon data={Lock} size={15}/><span>Данные доступны только вам</span></div></div></section>
          <section className="tip-card"><span className="tip-icon"><Icon data={ShieldCheck} size={23}/></span><Text as="h3" variant="subheader-1">Безопасность начинается с вас</Text><Text as="p" variant="body-1" color="secondary">Включите двухфакторную авторизацию, чтобы защитить аккаунт даже при утечке пароля.</Text><Button view="flat-action" size="s" onClick={() => {goTo('security'); document.getElementById('two-factor')?.focus({preventScroll: true});}}>К настройкам безопасности<Icon data={ChevronRight} size={13}/></Button></section>
          <div className="small-print">Ваш профиль. Ваши правила.<br/>Настройте пространство, в котором удобно.</div>
        </div>
      </div>
      <footer className="page-footer"><span>© 2026 Орбита</span><span>Место, где всё на своих местах.</span></footer>
    </main>
  </div>;
  return <><AsideHeader className="app-navigation" compact={compact} onChangeCompact={setCompact} hideCollapseButton hideSectionDividers aboveMenuContent={<div className={`sidebar-heading ${compact ? 'is-compact' : ''}`}><a href="#personal" className="brand" aria-label="Орбита — мой профиль" onClick={e => {e.preventDefault(); goTo('personal');}}><span className="brand-symbol"><span/><span/><span/></span>{!compact && <span>орбита<span className="brand-period">.</span></span>}</a>{!compact && <><div className="workspace-label">Личное пространство</div><div className="navigation-caption">НАСТРОЙКИ</div></>}</div>} menuItems={sections.map(section => ({...section, current: activeSection === section.id, onItemClick: () => goTo(section.id)}))} renderFooter={() => <div className={`sidebar-footer ${compact ? 'is-compact' : ''}`}>{!compact && <div className="sidebar-help"><span className="sidebar-help-title"><Icon data={CircleQuestion} size={17}/>Нужна помощь?</span><p>Мы рядом, если возникнут вопросы.</p><Button view="outlined" size="m" width="max" onClick={() => setHelpOpen(true)}>Центр помощи<Icon data={ChevronRight} size={13}/></Button></div>}<div className="sidebar-account"><ProfileAvatar profile={saved} size="s"/>{!compact && <div><strong>{saved.name}</strong><span>Личный аккаунт</span></div>}</div></div>} renderContent={() => content}/>
    {notice && <div className="toast" role="status"><Icon data={Check} size={18}/>{notice}<Button view="flat" size="s" onClick={() => setNotice('')} aria-label="Закрыть уведомление">×</Button></div>}
    <Modal open={helpOpen} onClose={() => setHelpOpen(false)} aria-labelledby="help-title"><div className="help-modal"><span className="tip-icon"><Icon data={CircleQuestion} size={25}/></span><Text as="h2" id="help-title" variant="header-1">Настройки, которые работают на вас</Text><p>Измените данные профиля, выберите язык и часовой пояс, настройте уведомления. Нажмите «Сохранить», чтобы применить изменения, или «Отмена», чтобы вернуться к последней сохранённой версии.</p><p>Для аватара подойдёт изображение JPG, PNG или WebP размером до 5 МБ. Вы увидите новое фото сразу после загрузки.</p><p className="help-footnote">В этой версии настройки хранятся в вашем браузере. Отправка писем, смена языка страницы и активация двухфакторной авторизации требуют подключения соответствующих сервисов.</p><Button view="action" size="l" onClick={() => setHelpOpen(false)}>Всё понятно</Button></div></Modal>
  </>;
}
