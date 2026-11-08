import {useEffect, useRef, useState} from 'react';
import {Avatar, Button, Checkbox, configure, Icon, Select, Switch, Text, TextInput, useFileInput} from '@gravity-ui/uikit';
import {ArrowUpFromLine, ArrowRight, Check, ChevronRight, CircleCheck, CircleExclamation, Clock, Envelope, Gear, Globe, Lock, Person, ShieldCheck} from '@gravity-ui/icons';
import {I18N} from '@gravity-ui/i18n';
import './styles.css';

const copy = {
  ru: {
    workspace: 'Личное пространство', settings: 'Настройки аккаунта', profile: 'Профиль',
    title: 'Настройки профиля', subtitle: 'Всё, что делает это пространство вашим.', protected: 'Данные под защитой',
    personal: 'Личные данные', personalHint: 'Представьтесь — так мы будем обращаться к вам.',
    photo: 'Фото профиля', upload: 'Загрузить фото', remove: 'Удалить', photoHint: 'JPG, PNG или WebP. До 5 МБ.',
    name: 'Имя', namePlaceholder: 'Как к вам обращаться?', email: 'Email', emailHint: 'Для входа и важных сообщений об аккаунте.',
    preferences: 'Предпочтения', preferencesHint: 'Пусть интерфейс работает в вашем ритме.', language: 'Язык интерфейса', timezone: 'Часовой пояс', search: 'Найти часовой пояс',
    security: 'Безопасность', twoFactor: 'Двухфакторная авторизация', twoFactorHint: 'Дополнительный уровень защиты при входе в аккаунт.', on: 'Включена', off: 'Выключена',
    notifications: 'Email-уведомления', notificationsHint: 'Выберите, о чём вы хотите узнавать.',
    news: 'Новости продукта', newsHint: 'Новые возможности, обновления и полезные советы.',
    alerts: 'Системные алерты', alertsHint: 'Важные события и изменения в работе сервиса.',
    digest: 'Дайджест за неделю', digestHint: 'Всё интересное за неделю в одном письме.',
    save: 'Сохранить', cancel: 'Отмена', saved: 'Все изменения сохранены', unsaved: 'Есть несохранённые изменения',
    savedMessage: 'Настройки профиля сохранены', cancelMessage: 'Изменения отменены', account: 'ЛИЧНЫЙ АККАУНТ', preview: 'Так выглядит ваш профиль',
    emptyName: 'Ваше имя', emptyEmail: 'Ваш email', languageShort: 'Язык', timezoneShort: 'Часовой пояс',
    tipTitle: 'Чуть больше спокойствия', tip: 'Включите двухфакторную авторизацию, чтобы ваш аккаунт был лучше защищён.', tipOn: 'Двухфакторная авторизация включена в настройках вашего профиля.', securityLink: 'К настройкам безопасности',
    privateTitle: 'Ваш профиль. Ваши правила.', privateHint: 'Личные данные доступны только вам.', footer: 'Маленькие настройки. Большой комфорт.',
    nameError: 'Введите имя', emailError: 'Введите корректный email', fileError: 'Выберите JPG, PNG или WebP размером до 5 МБ.', imageError: 'Не удалось открыть изображение. Попробуйте другой файл.', storageError: 'Не удалось сохранить настройки. Проверьте доступ к хранилищу браузера.',
    loadingPhoto: 'Обрабатываем фото…', moscow: 'Москва', london: 'Лондон', berlin: 'Берлин', dubai: 'Дубай', almaty: 'Алматы', newYork: 'Нью-Йорк', tokyo: 'Токио',
  },
  en: {
    workspace: 'Personal workspace', settings: 'Account settings', profile: 'Profile',
    title: 'Profile settings', subtitle: 'Everything that makes this space yours.', protected: 'Your data is protected',
    personal: 'Personal information', personalHint: 'Introduce yourself — let us know what to call you.',
    photo: 'Profile photo', upload: 'Upload photo', remove: 'Remove', photoHint: 'JPG, PNG or WebP. Up to 5 MB.',
    name: 'Name', namePlaceholder: 'What should we call you?', email: 'Email', emailHint: 'For signing in and important account updates.',
    preferences: 'Preferences', preferencesHint: 'An interface that works at your pace.', language: 'Interface language', timezone: 'Time zone', search: 'Find a time zone',
    security: 'Security', twoFactor: 'Two-factor authentication', twoFactorHint: 'An extra layer of protection when signing in.', on: 'Enabled', off: 'Disabled',
    notifications: 'Email notifications', notificationsHint: 'Choose what you would like to hear about.',
    news: 'Product news', newsHint: 'New features, updates and helpful tips.', alerts: 'System alerts', alertsHint: 'Important events and service updates.', digest: 'Weekly digest', digestHint: 'The week’s highlights in a single email.',
    save: 'Save changes', cancel: 'Cancel', saved: 'All changes saved', unsaved: 'You have unsaved changes',
    savedMessage: 'Profile settings saved', cancelMessage: 'Changes discarded', account: 'PERSONAL ACCOUNT', preview: 'This is how your profile looks',
    emptyName: 'Your name', emptyEmail: 'Your email', languageShort: 'Language', timezoneShort: 'Time zone',
    tipTitle: 'A little peace of mind', tip: 'Enable two-factor authentication to add more protection to your account.', tipOn: 'Two-factor authentication is enabled in your profile preferences.', securityLink: 'Go to security settings',
    privateTitle: 'Your profile. Your rules.', privateHint: 'Your personal details are only visible to you.', footer: 'Small settings. A little more comfort.',
    nameError: 'Enter your name', emailError: 'Enter a valid email address', fileError: 'Choose a JPG, PNG or WebP file up to 5 MB.', imageError: 'Could not open this image. Try a different file.', storageError: 'Could not save settings. Check access to browser storage.',
    loadingPhoto: 'Processing photo…', moscow: 'Moscow', london: 'London', berlin: 'Berlin', dubai: 'Dubai', almaty: 'Almaty', newYork: 'New York', tokyo: 'Tokyo',
  },
};

type CopyKey = keyof typeof copy.ru;
type Profile = {
  name: string; email: string; avatar: string; language: 'ru' | 'en'; timezone: string;
  twoFactor: boolean; news: boolean; alerts: boolean; digest: boolean;
};
const initialProfile: Profile = {
  name: 'Александр Смирнов', email: 'alex.smirnov@gmail.com', avatar: '', language: 'ru',
  timezone: 'Europe/Moscow', twoFactor: false, news: true, alerts: true, digest: false,
};
const storageKey = 'forma-profile-v1';
const i18n = new I18N();
i18n.registerKeysets('ru', {profile: copy.ru});
i18n.registerKeysets('en', {profile: copy.en});

function readProfile(): Profile {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (!data || typeof data !== 'object') return initialProfile;
    const result = {...initialProfile};
    for (const key of ['name', 'email', 'avatar', 'timezone'] as const) {
      if (typeof data[key] === 'string') result[key] = data[key];
    }
    for (const key of ['twoFactor', 'news', 'alerts', 'digest'] as const) {
      if (typeof data[key] === 'boolean') result[key] = data[key];
    }
    if (data.language === 'ru' || data.language === 'en') result.language = data.language;
    if (result.avatar && !result.avatar.startsWith('data:image/')) result.avatar = '';
    return result;
  } catch { return initialProfile; }
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
}

export function App() {
  const [saved, setSaved] = useState<Profile>(readProfile);
  const [draft, setDraft] = useState<Profile>(saved);
  const [submitted, setSubmitted] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [notice, setNotice] = useState<{key: CopyKey; error?: boolean} | null>(null);
  const photoVersion = useRef(0);
  i18n.setLang(saved.language);
  const t = (key: CopyKey) => i18n.i18n('profile', key);
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const nameInvalid = !draft.name.trim();
  const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim());
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setDraft(current => ({...current, [key]: value}));
    setNotice(null);
  };

  useEffect(() => {
    configure({lang: saved.language});
    document.documentElement.lang = saved.language;
    document.title = `${copy[saved.language].title} — forma`;
  }, [saved.language]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const {controlProps, triggerProps} = useFileInput({onUpdate: files => {
    const file = files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setNotice({key: 'fileError', error: true});
      return;
    }
    const version = ++photoVersion.current;
    setPhotoLoading(true);
    setNotice(null);
    const url = URL.createObjectURL(file);
    const image = new Image();
    const finish = () => {
      URL.revokeObjectURL(url);
      if (version === photoVersion.current) setPhotoLoading(false);
    };
    image.onload = () => {
      try {
        if (version !== photoVersion.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 256;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 256, 256);
        update('avatar', canvas.toDataURL('image/png'));
      } catch { setNotice({key: 'imageError', error: true}); }
      finally { finish(); }
    };
    image.onerror = () => {
      if (version === photoVersion.current) setNotice({key: 'imageError', error: true});
      finish();
    };
    image.src = url;
  }});

  const timezones = [
    {value: 'Europe/Moscow', content: `(UTC+03:00) ${t('moscow')}`},
    {value: 'Europe/London', content: t('london')},
    {value: 'Europe/Berlin', content: t('berlin')},
    {value: 'Asia/Dubai', content: `(UTC+04:00) ${t('dubai')}`},
    {value: 'Asia/Almaty', content: `(UTC+05:00) ${t('almaty')}`},
    {value: 'America/New_York', content: t('newYork')},
    {value: 'Asia/Tokyo', content: `(UTC+09:00) ${t('tokyo')}`},
    {value: 'UTC', content: '(UTC+00:00) UTC'},
  ];
  const avatar = (size: 's' | 'l' | 'xl', profile = draft) => profile.avatar
    ? <Avatar size={size} imgUrl={profile.avatar} alt={profile.name} className="profile-avatar" />
    : <Avatar size={size} text={initials(profile.name)} className="profile-avatar" />;

  const sectionTitle = (icon: typeof Person, title: CopyKey, hint?: CopyKey) => (
    <div className="section-heading">
      <span className="section-icon"><Icon data={icon} size={18} /></span>
      <div className="section-heading-text">
        <Text as="h2" variant="subheader-2">{t(title)}</Text>
        {hint && <Text as="p" variant="body-1" color="secondary">{t(hint)}</Text>}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand" aria-label="forma"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span><span>forma<span className="brand-period">.</span></span></div>
          <div className="header-account"><span className="workspace-label"><span className="status-dot" />{t('workspace')}</span><span className="header-divider" />{avatar('s', saved)}</div>
        </div>
      </header>

      <main className="page">
        <div className="breadcrumb"><Icon data={Gear} size={15} /><span>{t('settings')}</span><Icon data={ChevronRight} size={12} /><span className="breadcrumb-current">{t('profile')}</span></div>
        <div className="page-heading">
          <div><Text as="h1" variant="display-2">{t('title')}</Text><Text as="p" variant="body-2" color="secondary">{t('subtitle')}</Text></div>
          <span className="protected-label"><Icon data={Lock} size={14} />{t('protected')}</span>
        </div>

        <div className="content-grid">
          <form className="settings-card" noValidate onSubmit={event => {
            event.preventDefault();
            setSubmitted(true);
            if (nameInvalid || emailInvalid) {
              document.getElementById(nameInvalid ? 'profile-name' : 'profile-email')?.focus();
              return;
            }
            const next = {...draft, name: draft.name.trim(), email: draft.email.trim()};
            try {
              localStorage.setItem(storageKey, JSON.stringify(next));
              setSaved(next); setDraft(next); setSubmitted(false); setNotice({key: 'savedMessage'});
            } catch { setNotice({key: 'storageError', error: true}); }
          }}>
            <section className="form-section personal-section">
              {sectionTitle(Person, 'personal', 'personalHint')}
              <div className="avatar-upload">
                <div className="avatar-upload-image">{avatar('l')}<span className="avatar-check"><Icon data={Check} size={10} /></span></div>
                <div className="avatar-upload-content">
                  <Text as="div" variant="body-2" className="field-label">{t('photo')}</Text>
                  <div className="upload-actions">
                    <input {...controlProps} accept="image/jpeg,image/png,image/webp" aria-label={t('photo')} />
                    <Button {...triggerProps} type="button" view="outlined" size="m" loading={photoLoading}><Icon data={ArrowUpFromLine} size={14} />{t('upload')}</Button>
                    {draft.avatar && <Button type="button" view="flat-secondary" size="m" onClick={() => update('avatar', '')}>{t('remove')}</Button>}
                  </div>
                  <Text as="div" variant="caption-2" color="secondary">{t(photoLoading ? 'loadingPhoto' : 'photoHint')}</Text>
                </div>
              </div>
              <div className="field-grid">
                <div className="field"><label htmlFor="profile-name">{t('name')}</label><TextInput id="profile-name" size="l" autoComplete="name" value={draft.name} placeholder={t('namePlaceholder')} onUpdate={value => update('name', value)} validationState={submitted && nameInvalid ? 'invalid' : undefined} errorMessage={submitted && nameInvalid ? t('nameError') : undefined} controlProps={{maxLength: 80, 'aria-required': true}} /></div>
                <div className="field"><label htmlFor="profile-email">{t('email')}</label><TextInput id="profile-email" size="l" type="email" autoComplete="email" value={draft.email} placeholder="you@example.com" onUpdate={value => update('email', value)} validationState={submitted && emailInvalid ? 'invalid' : undefined} errorMessage={submitted && emailInvalid ? t('emailError') : undefined} controlProps={{maxLength: 254, 'aria-required': true, 'aria-describedby': 'email-hint'}} /><Text as="span" id="email-hint" variant="caption-2" color="secondary">{t('emailHint')}</Text></div>
              </div>
            </section>

            <section className="form-section">
              {sectionTitle(Globe, 'preferences', 'preferencesHint')}
              <div className="field-grid">
                <div className="field"><label id="language-label">{t('language')}</label><Select size="l" width="max" aria-labelledby="language-label" value={[draft.language]} options={[{value: 'ru', content: 'Русский'}, {value: 'en', content: 'English'}]} onUpdate={value => update('language', value[0] as 'ru' | 'en')} /></div>
                <div className="field"><label id="timezone-label">{t('timezone')}</label><Select size="l" width="max" aria-labelledby="timezone-label" value={[draft.timezone]} options={timezones} filterable filterPlaceholder={t('search')} onUpdate={value => update('timezone', value[0])} /></div>
              </div>
            </section>

            <section className="form-section" id="security">
              {sectionTitle(ShieldCheck, 'security')}
              <div className="security-row"><div className="security-copy"><div className="security-title"><label htmlFor="two-factor">{t('twoFactor')}</label><span className={`security-state ${draft.twoFactor ? 'is-on' : ''}`}>{t(draft.twoFactor ? 'on' : 'off')}</span></div><Text as="p" variant="body-1" color="secondary">{t('twoFactorHint')}</Text></div><Switch id="two-factor" size="l" checked={draft.twoFactor} onUpdate={value => update('twoFactor', value)} controlProps={{'aria-label': t('twoFactor')}} /></div>
            </section>

            <section className="form-section notification-section">
              {sectionTitle(Envelope, 'notifications', 'notificationsHint')}
              <div className="notification-options">
                {(['news', 'alerts', 'digest'] as const).map(key => (
                  <Checkbox key={key} size="l" checked={draft[key]} onUpdate={value => update(key, value)}>
                    <span className="checkbox-content"><span className="checkbox-title">{t(key)}</span><Text as="span" variant="body-1" color="secondary">{t(`${key}Hint`)}</Text></span>
                  </Checkbox>
                ))}
              </div>
            </section>

            {notice && <div role={notice.error ? 'alert' : 'status'} className={`notice ${notice.error ? 'notice-error' : ''}`}><Icon data={notice.error ? CircleExclamation : CircleCheck} size={16} />{t(notice.key)}</div>}
            <div className="form-footer">
              <div className="footer-actions"><Button type="submit" size="l" view="action" disabled={photoLoading}><Icon data={Check} size={16} />{t('save')}</Button><Button type="button" size="l" view="outlined" onClick={() => { photoVersion.current++; setPhotoLoading(false); setDraft(saved); setSubmitted(false); setNotice({key: 'cancelMessage'}); }}>{t('cancel')}</Button></div>
              <span className={`save-state ${dirty ? 'is-dirty' : ''}`}><span className="status-dot" />{t(dirty ? 'unsaved' : 'saved')}</span>
            </div>
          </form>

          <div className="profile-sidebar">
            <section className="preview-card" aria-label={t('preview')}>
              <div className="preview-cover"><span className="cover-orbit orbit-one" /><span className="cover-orbit orbit-two" /><span className="cover-star" /><span className="cover-dot" /></div>
              <div className="preview-avatar">{avatar('xl')}</div>
              <div className="preview-identity"><Text as="p" variant="caption-1" className="account-eyebrow">{t('account')}</Text><Text as="h2" variant="subheader-3" className="preview-name">{draft.name.trim() || t('emptyName')}</Text><Text as="p" variant="body-1" color="secondary" className="preview-email">{draft.email || t('emptyEmail')}</Text></div>
              <div className="preview-details"><div className="preview-detail"><Icon data={Globe} size={16} /><div><Text as="span" variant="caption-2" color="secondary">{t('languageShort')}</Text><Text as="span" variant="body-1">{draft.language === 'ru' ? 'Русский' : 'English'}</Text></div></div><div className="preview-detail"><Icon data={Clock} size={16} /><div><Text as="span" variant="caption-2" color="secondary">{t('timezoneShort')}</Text><Text as="span" variant="body-1">{timezones.find(zone => zone.value === draft.timezone)?.content || draft.timezone}</Text></div></div></div>
              <div className="preview-caption"><span className="status-dot" />{t('preview')}</div>
            </section>

            <section className="security-tip"><span className="tip-icon"><Icon data={ShieldCheck} size={23} /></span><Text as="h2" variant="subheader-2">{t('tipTitle')}</Text><Text as="p" variant="body-1" color="secondary">{t(draft.twoFactor ? 'tipOn' : 'tip')}</Text><Button href="#security" view="flat" size="m" className="security-link">{t('securityLink')}<Icon data={ArrowRight} size={14} /></Button></section>
            <div className="privacy-note"><Icon data={Lock} size={15} /><div><Text as="p" variant="body-1">{t('privateTitle')}</Text><Text as="p" variant="caption-2" color="secondary">{t('privateHint')}</Text></div></div>
          </div>
        </div>
        <footer className="page-footer"><span className="footer-brand">forma.</span><Text variant="caption-2" color="secondary">{t('footer')}</Text><span className="footer-year">© {new Date().getFullYear()} forma</span></footer>
      </main>
    </div>
  );
}
