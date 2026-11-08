import { ChangeEvent, useRef, useState } from 'react';
import './profile.css';

type Profile = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: { product: boolean; alerts: boolean; digest: boolean };
  avatar: string;
};

const initialProfile: Profile = {
  name: 'Александр Петров',
  email: 'alex.petrov@company.com',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: true,
  notifications: { product: true, alerts: true, digest: false },
  avatar: '',
};

const languages = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
];

const timezones = [
  { value: 'Europe/Moscow', label: '(UTC+03:00) Москва' },
  { value: 'Europe/Kaliningrad', label: '(UTC+02:00) Калининград' },
  { value: 'Asia/Yekaterinburg', label: '(UTC+05:00) Екатеринбург' },
  { value: 'Asia/Novosibirsk', label: '(UTC+07:00) Новосибирск' },
  { value: 'Europe/London', label: '(UTC+00:00) Лондон' },
  { value: 'America/New_York', label: '(UTC−05:00) Нью-Йорк' },
];

export function App() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [saved, setSaved] = useState<Profile>(initialProfile);
  const [notice, setNotice] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const update = <K extends keyof Profile,>(key: K, value: Profile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setNotice('');
  };

  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    update('avatar', URL.createObjectURL(file));
  };

  const save = () => {
    setSaved(profile);
    setNotice('Изменения сохранены');
  };

  const cancel = () => {
    setProfile(saved);
    setNotice('Изменения отменены');
  };

  return (
    <main className="settings-page">
      <div className="page-shell">
        <header className="page-header">
          <div className="breadcrumb"><span>Настройки</span><span className="crumb-divider">/</span><strong>Профиль</strong></div>
          <h1>Настройки профиля</h1>
          <p>Управляйте личной информацией и настройками аккаунта</p>
        </header>

        <div className="settings-layout">
          <aside className="settings-nav" aria-label="Разделы настроек">
            <div className="nav-label">АККАУНТ</div>
            <button className="nav-item active" type="button"><span className="nav-icon">◉</span>Профиль</button>
            <button className="nav-item" type="button"><span className="nav-icon">♙</span>Безопасность</button>
            <button className="nav-item" type="button"><span className="nav-icon">⚙</span>Предпочтения</button>
          </aside>

          <section className="settings-card" aria-label="Профиль пользователя">
            <section className="form-section personal-section">
              <div className="section-heading">
                <div><h2>Личная информация</h2><p>Основные данные вашего аккаунта</p></div>
              </div>

              <div className="avatar-row">
                <div className="avatar" aria-label="Аватар профиля">
                  {profile.avatar ? <img src={profile.avatar} alt="Аватар профиля" /> : <span>АП</span>}
                </div>
                <div className="avatar-copy">
                  <strong>Фото профиля</strong>
                  <span>JPG, PNG или GIF. Не более 5 МБ.</span>
                  <div className="avatar-actions">
                    <button className="button button-secondary button-small" type="button" onClick={() => fileInput.current?.click()}>Загрузить фото</button>
                    {profile.avatar && <button className="text-button" type="button" onClick={() => update('avatar', '')}>Удалить</button>}
                    <input ref={fileInput} className="visually-hidden" type="file" accept="image/png,image/jpeg,image/gif" onChange={onAvatarChange} />
                  </div>
                </div>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span className="field-label">Имя <span className="required">*</span></span>
                  <input type="text" value={profile.name} onChange={(e) => update('name', e.target.value)} placeholder="Ваше имя" />
                </label>
                <label className="field">
                  <span className="field-label">Email <span className="required">*</span></span>
                  <input type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" />
                </label>
              </div>
            </section>

            <section className="form-section preferences-section">
              <div className="section-heading">
                <div><h2>Предпочтения</h2><p>Настройте интерфейс под себя</p></div>
              </div>
              <div className="field-grid">
                <label className="field">
                  <span className="field-label">Язык интерфейса</span>
                  <span className="select-wrap"><select value={profile.language} onChange={(e) => update('language', e.target.value)}>{languages.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className="select-chevron">⌄</span></span>
                </label>
                <label className="field">
                  <span className="field-label">Часовой пояс</span>
                  <span className="select-wrap"><select value={profile.timezone} onChange={(e) => update('timezone', e.target.value)}>{timezones.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className="select-chevron">⌄</span></span>
                </label>
              </div>
            </section>

            <section className="form-section security-section">
              <div className="section-heading">
                <div><h2>Безопасность</h2><p>Защитите свой аккаунт дополнительным уровнем проверки</p></div>
              </div>
              <div className="toggle-row">
                <div className="row-icon security-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Zm0 3.1 4 1.7v3.2c0 3-1.7 5.6-4 6.9-2.3-1.3-4-3.9-4-6.9V7.8l4-1.7Zm-1 8.9 5-5-1.4-1.4-3.6 3.6-1.6-1.6L8 11l3 4Z" /></svg></div>
                <div className="row-copy"><strong>Двухфакторная авторизация</strong><span>Требовать код подтверждения при входе</span></div>
                <button className={`switch ${profile.twoFactor ? 'is-on' : ''}`} type="button" role="switch" aria-checked={profile.twoFactor} aria-label="Двухфакторная авторизация" onClick={() => update('twoFactor', !profile.twoFactor)}><span /></button>
              </div>
            </section>

            <section className="form-section notifications-section">
              <div className="section-heading">
                <div><h2>Email-уведомления</h2><p>Выберите, о чём мы будем вам писать</p></div>
              </div>
              <div className="checkbox-list">
                <label className="check-row"><input type="checkbox" checked={profile.notifications.product} onChange={(e) => update('notifications', { ...profile.notifications, product: e.target.checked })} /><span className="custom-check" /><span className="check-copy"><strong>Новости продукта</strong><span>Новые функции и важные обновления</span></span></label>
                <label className="check-row"><input type="checkbox" checked={profile.notifications.alerts} onChange={(e) => update('notifications', { ...profile.notifications, alerts: e.target.checked })} /><span className="custom-check" /><span className="check-copy"><strong>Системные алерты</strong><span>Важные события и уведомления безопасности</span></span></label>
                <label className="check-row"><input type="checkbox" checked={profile.notifications.digest} onChange={(e) => update('notifications', { ...profile.notifications, digest: e.target.checked })} /><span className="custom-check" /><span className="check-copy"><strong>Дайджест за неделю</strong><span>Краткая сводка активности раз в неделю</span></span></label>
              </div>
            </section>

            <footer className="form-footer">
              <span className={`save-notice ${notice ? 'visible' : ''}`} role="status">{notice || ' '}</span>
              <div className="footer-actions">
                <button className="button button-secondary" type="button" onClick={cancel}>Отмена</button>
                <button className="button button-primary" type="button" onClick={save}>Сохранить</button>
              </div>
            </footer>
          </section>
        </div>
        <div className="page-footnote"><span className="footnote-dot" /> Ваши данные защищены и доступны только вам</div>
      </div>
    </main>
  );
}
