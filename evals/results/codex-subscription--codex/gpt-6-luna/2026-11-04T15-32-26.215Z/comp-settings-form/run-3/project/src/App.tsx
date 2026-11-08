import { ChangeEvent, useRef, useState } from 'react';
import './app.css';

type ProfileSettings = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: {
    product: boolean;
    alerts: boolean;
    digest: boolean;
  };
  avatar: string;
};

const initialSettings: ProfileSettings = {
  name: 'Александр Смирнов',
  email: 'alexander.smirnov@example.com',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: true,
  notifications: { product: true, alerts: true, digest: false },
  avatar: '',
};

function UploadIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5M4 12.5v3A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-3" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.5-3.4 3.1-5.5 6.5-5.5s6 2.1 6.5 5.5"/></svg>;
}

export function App() {
  const [settings, setSettings] = useState<ProfileSettings>(initialSettings);
  const [savedSettings, setSavedSettings] = useState<ProfileSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const updateNotification = (key: keyof ProfileSettings['notifications']) => (event: ChangeEvent<HTMLInputElement>) => {
    update('notifications', { ...settings.notifications, [key]: event.target.checked });
  };

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('avatar', String(reader.result));
    reader.readAsDataURL(file);
  };

  const cancel = () => {
    setSettings(savedSettings);
    setSaved(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <main className="page-shell">
      <div className="settings-layout">
        <aside className="sidebar">
          <a className="brand" href="#top" aria-label="Главная">
            <span className="brand-mark"><span /></span>
            <span>orbit<span className="brand-dot">.</span></span>
          </a>
          <div className="sidebar-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <nav className="side-nav" aria-label="Основная навигация">
            <a href="#overview"><span className="nav-icon grid-icon">▦</span>Обзор</a>
            <a href="#projects"><span className="nav-icon">◫</span>Проекты</a>
            <a href="#team"><span className="nav-icon">♧</span>Команда</a>
          </nav>
          <div className="sidebar-caption settings-caption">НАСТРОЙКИ</div>
          <nav className="side-nav" aria-label="Настройки">
            <a href="#workspace"><span className="nav-icon">⚙</span>Рабочее пространство</a>
            <a className="active" href="#profile"><span className="nav-icon"><UserIcon /></span>Профиль</a>
            <a href="#security"><span className="nav-icon">◇</span>Безопасность</a>
          </nav>
          <div className="sidebar-bottom">
            <div className="help-card"><span className="help-spark">✳</span><strong>Нужна помощь?</strong><span>Загляните в центр поддержки</span><a href="#help">Открыть справку <span>↗</span></a></div>
            <div className="workspace-user"><div className="mini-avatar">АС</div><div><strong>Александр Смирнов</strong><span>Личный аккаунт</span></div><span className="more">•••</span></div>
          </div>
        </aside>

        <section className="content" id="top">
          <header className="topbar">
            <div className="breadcrumbs"><span>Настройки</span><span className="crumb-sep">/</span><strong>Профиль</strong></div>
            <div className="topbar-right"><button className="icon-button" aria-label="Справка">?</button><button className="bell-button" aria-label="Уведомления">♧<i /></button><div className="top-avatar">АС</div></div>
          </header>

          <div className="content-inner">
            <div className="page-heading">
              <div><div className="eyebrow">ВАШ АККАУНТ</div><h1>Настройки профиля</h1><p>Управляйте личными данными и настройками аккаунта.</p></div>
              <div className="updated-label"><span className="status-dot" />Все изменения сохранены</div>
            </div>

            <div className="form-card">
              <section className="form-section personal-section">
                <div className="section-heading"><div className="section-icon"><UserIcon /></div><div><h2>Личная информация</h2><p>Основные данные вашего профиля.</p></div></div>
                <div className="section-body">
                  <div className="avatar-row">
                    <div className="avatar-preview">{settings.avatar ? <img src={settings.avatar} alt="Аватар профиля" /> : <span>АС</span>}<span className="avatar-edit">✎</span></div>
                    <div className="avatar-copy"><strong>Фото профиля</strong><span>Это фото будет отображаться в вашем профиле.</span><div className="avatar-actions"><button type="button" className="upload-button" onClick={() => fileRef.current?.click()}><UploadIcon />Загрузить фото</button><span>JPG, PNG или GIF · до 5 МБ</span><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleAvatar} hidden /></div></div>
                  </div>
                  <div className="field-grid">
                    <label className="field"><span>Имя</span><input value={settings.name} onChange={(e) => update('name', e.target.value)} placeholder="Ваше имя" /></label>
                    <label className="field"><span>Email</span><div className="input-with-icon"><span className="input-leading">✉</span><input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" /></div></label>
                  </div>
                </div>
              </section>

              <section className="form-section preferences-section">
                <div className="section-heading"><div className="section-icon globe-icon">◎</div><div><h2>Язык и регион</h2><p>Настройте интерфейс под себя.</p></div></div>
                <div className="section-body field-grid">
                  <label className="field"><span>Язык интерфейса</span><div className="select-wrap"><select value={settings.language} onChange={(e) => update('language', e.target.value)}><option value="ru">Русский</option><option value="en">English</option><option value="es">Español</option><option value="de">Deutsch</option><option value="fr">Français</option></select></div><small>Язык меню и системных сообщений.</small></label>
                  <label className="field"><span>Часовой пояс</span><div className="select-wrap"><select value={settings.timezone} onChange={(e) => update('timezone', e.target.value)}><option value="Europe/Moscow">(UTC+03:00) Москва</option><option value="Europe/London">(UTC+00:00) Лондон</option><option value="Europe/Berlin">(UTC+01:00) Берлин</option><option value="Asia/Almaty">(UTC+05:00) Алматы</option><option value="Asia/Tokyo">(UTC+09:00) Токио</option><option value="America/New_York">(UTC−05:00) Нью-Йорк</option><option value="America/Los_Angeles">(UTC−08:00) Лос-Анджелес</option></select></div><small>Используется для отображения времени.</small></label>
                </div>
              </section>

              <section className="form-section security-section">
                <div className="section-heading"><div className="section-icon shield-icon">◇</div><div><h2>Безопасность</h2><p>Защитите свой аккаунт.</p></div></div>
                <div className="section-body">
                  <div className="setting-row"><div className="setting-copy"><strong>Двухфакторная авторизация</strong><span>Дополнительный уровень защиты при входе в аккаунт.</span></div><button type="button" role="switch" aria-checked={settings.twoFactor} aria-label="Двухфакторная авторизация" className={`switch ${settings.twoFactor ? 'on' : ''}`} onClick={() => update('twoFactor', !settings.twoFactor)}><span /></button></div>
                </div>
              </section>

              <section className="form-section notifications-section">
                <div className="section-heading"><div className="section-icon mail-icon">✉</div><div><h2>Email-уведомления</h2><p>Выберите, какие письма вы хотите получать.</p></div></div>
                <div className="section-body notification-list">
                  <label className="check-row"><input type="checkbox" checked={settings.notifications.product} onChange={updateNotification('product')} /><span className="custom-check">✓</span><span className="setting-copy"><strong>Новости продукта</strong><span>Новые функции, обновления и полезные советы.</span></span></label>
                  <label className="check-row"><input type="checkbox" checked={settings.notifications.alerts} onChange={updateNotification('alerts')} /><span className="custom-check">✓</span><span className="setting-copy"><strong>Системные алерты</strong><span>Важные события и изменения безопасности аккаунта.</span></span></label>
                  <label className="check-row"><input type="checkbox" checked={settings.notifications.digest} onChange={updateNotification('digest')} /><span className="custom-check">✓</span><span className="setting-copy"><strong>Дайджест за неделю</strong><span>Краткий обзор активности за последние семь дней.</span></span></label>
                </div>
              </section>

              <footer className="form-footer"><span className="save-message">{saved ? <><span className="saved-check">✓</span>Настройки сохранены</> : 'Изменения применятся ко всем вашим устройствам.'}</span><div className="footer-actions"><button className="cancel-button" type="button" onClick={cancel}>Отмена</button><button className="save-button" type="button" onClick={() => { setSavedSettings(settings); setSaved(true); }}>Сохранить изменения <span>→</span></button></div></footer>
            </div>
            <div className="page-footnote">Последний вход: сегодня, 10:42 <span>·</span> <a href="#sessions">Управление активными сеансами</a></div>
          </div>
        </section>
      </div>
    </main>
  );
}
