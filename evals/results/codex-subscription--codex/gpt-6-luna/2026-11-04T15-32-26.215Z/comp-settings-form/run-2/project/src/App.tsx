import { ChangeEvent, useRef, useState } from 'react';
import './App.css';

type Settings = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: { news: boolean; alerts: boolean; digest: boolean };
  avatar: string;
};

const initialSettings: Settings = {
  name: 'Александр Иванов',
  email: 'alex.ivanov@example.com',
  language: 'Русский',
  timezone: 'Europe/Moscow',
  twoFactor: true,
  notifications: { news: true, alerts: true, digest: false },
  avatar: '',
};

const timezones = [
  ['Europe/Kaliningrad', 'Калининград (UTC+2)'],
  ['Europe/Moscow', 'Москва (UTC+3)'],
  ['Asia/Yekaterinburg', 'Екатеринбург (UTC+5)'],
  ['Asia/Novosibirsk', 'Новосибирск (UTC+7)'],
  ['Asia/Vladivostok', 'Владивосток (UTC+10)'],
  ['Europe/London', 'Лондон (UTC+0)'],
  ['Europe/Berlin', 'Берлин (UTC+1)'],
  ['America/New_York', 'Нью-Йорк (UTC−5)'],
  ['America/Los_Angeles', 'Лос-Анджелес (UTC−8)'],
];

function Avatar({ name, src }: { name: string; src: string }) {
  return src ? <img className="avatar" src={src} alt="Аватар профиля" /> :
    <div className="avatar avatar-placeholder" aria-label={`Аватар ${name}`}>
      {name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
    </div>;
}

export function App() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [saved, setSaved] = useState<Settings>(initialSettings);
  const [notice, setNotice] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice('');
  };

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => update('avatar', String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const save = () => {
    setSaved(settings);
    setNotice('Изменения сохранены');
  };

  const cancel = () => {
    setSettings(saved);
    setNotice('Изменения отменены');
  };

  const changeNotification = (key: keyof Settings['notifications']) => (checked: boolean) => {
    setSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: checked },
    }));
    setNotice('');
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="На главную">
          <span className="brand-mark">n</span><span>northstar</span>
        </a>
        <div className="topbar-right">
          <button className="icon-button" aria-label="Справка">?</button>
          <Avatar name={settings.name} src={settings.avatar} />
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <a className="nav-item" href="#overview"><span className="nav-icon">◫</span>Обзор</a>
          <a className="nav-item" href="#projects"><span className="nav-icon">▤</span>Проекты</a>
          <a className="nav-item" href="#team"><span className="nav-icon">♧</span>Команда</a>
          <div className="workspace-label nav-section-label">АККАУНТ</div>
          <a className="nav-item active" href="#profile"><span className="nav-icon">⚙</span>Настройки</a>
          <div className="sidebar-bottom"><span className="status-dot" /> Все системы работают</div>
        </aside>

        <section className="content">
          <div className="breadcrumbs"><span>Настройки</span><span className="crumb-slash">/</span><strong>Профиль</strong></div>
          <div className="page-heading">
            <div>
              <h1>Настройки профиля</h1>
              <p>Управляйте личной информацией и предпочтениями аккаунта.</p>
            </div>
            <span className="heading-avatar"><Avatar name={settings.name} src={settings.avatar} /></span>
          </div>

          <div className="settings-card">
            <section className="form-section profile-section">
              <div className="section-copy">
                <h2>Личная информация</h2>
                <p>Обновите данные, которые видны вашей команде.</p>
              </div>
              <div className="section-fields">
                <div className="avatar-row">
                  <Avatar name={settings.name} src={settings.avatar} />
                  <div className="avatar-actions">
                    <strong>Фото профиля</strong>
                    <span>JPG, PNG или GIF · до 5 МБ</span>
                    <div className="avatar-buttons">
                      <button className="button button-secondary button-small" type="button" onClick={() => uploadRef.current?.click()}>Загрузить фото</button>
                      {settings.avatar && <button className="text-button" type="button" onClick={() => update('avatar', '')}>Удалить</button>}
                      <input ref={uploadRef} className="visually-hidden" type="file" accept="image/*" onChange={handleAvatar} />
                    </div>
                  </div>
                </div>
                <label className="field">
                  <span className="field-label">Имя</span>
                  <input value={settings.name} onChange={(e) => update('name', e.target.value)} placeholder="Ваше имя" />
                </label>
                <label className="field">
                  <span className="field-label">Email</span>
                  <input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" />
                  <span className="field-hint">Используется для входа и важных уведомлений.</span>
                </label>
              </div>
            </section>

            <section className="form-section preferences-section">
              <div className="section-copy">
                <h2>Предпочтения</h2>
                <p>Настройте интерфейс под себя.</p>
              </div>
              <div className="section-fields split-fields">
                <label className="field">
                  <span className="field-label">Язык интерфейса</span>
                  <select value={settings.language} onChange={(e) => update('language', e.target.value)}>
                    <option>Русский</option><option>English</option><option>Español</option><option>Deutsch</option><option>Français</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Часовой пояс</span>
                  <select value={settings.timezone} onChange={(e) => update('timezone', e.target.value)}>
                    {timezones.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
            </section>

            <section className="form-section security-section">
              <div className="section-copy">
                <h2>Безопасность</h2>
                <p>Дополнительная защита вашего аккаунта.</p>
              </div>
              <div className="section-fields">
                <div className="setting-row">
                  <div className="setting-description"><strong>Двухфакторная авторизация</strong><span>Запрашивать код подтверждения при входе с нового устройства.</span></div>
                  <button type="button" role="switch" aria-checked={settings.twoFactor} aria-label="Двухфакторная авторизация" className={`switch ${settings.twoFactor ? 'on' : ''}`} onClick={() => update('twoFactor', !settings.twoFactor)}><span /></button>
                </div>
              </div>
            </section>

            <section className="form-section notifications-section">
              <div className="section-copy">
                <h2>Email-уведомления</h2>
                <p>Выберите, о чём мы будем вам писать.</p>
              </div>
              <div className="section-fields check-fields">
                <label className="check-row"><input type="checkbox" checked={settings.notifications.news} onChange={(e) => changeNotification('news')(e.target.checked)} /><span className="custom-check" /><span><strong>Новости продукта</strong><small>Новые функции, улучшения и полезные советы.</small></span></label>
                <label className="check-row"><input type="checkbox" checked={settings.notifications.alerts} onChange={(e) => changeNotification('alerts')(e.target.checked)} /><span className="custom-check" /><span><strong>Системные алерты</strong><small>Важные обновления и события безопасности аккаунта.</small></span></label>
                <label className="check-row"><input type="checkbox" checked={settings.notifications.digest} onChange={(e) => changeNotification('digest')(e.target.checked)} /><span className="custom-check" /><span><strong>Дайджест за неделю</strong><small>Короткий обзор активности в вашем рабочем пространстве.</small></span></label>
              </div>
            </section>

            <footer className="form-footer">
              <span className="save-notice" aria-live="polite">{notice}</span>
              <div className="footer-actions">
                <button className="button button-plain" type="button" onClick={cancel}>Отмена</button>
                <button className="button button-primary" type="button" onClick={save}>Сохранить изменения</button>
              </div>
            </footer>
          </div>
          <p className="page-footnote">Нужна помощь с аккаунтом? <a href="mailto:support@example.com">Свяжитесь с поддержкой</a></p>
        </section>
      </div>
    </main>
  );
}
