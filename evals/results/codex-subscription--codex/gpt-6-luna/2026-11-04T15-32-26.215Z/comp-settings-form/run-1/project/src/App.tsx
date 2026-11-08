import { ChangeEvent, useRef, useState } from 'react';
import './App.css';

type Profile = {
  name: string;
  email: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  updates: boolean;
  alerts: boolean;
  digest: boolean;
  avatar: string;
};

const initialProfile: Profile = {
  name: 'Александр Иванов',
  email: 'alex.ivanov@example.com',
  language: 'Русский',
  timezone: 'Europe/Moscow',
  twoFactor: true,
  updates: true,
  alerts: true,
  digest: false,
  avatar: '',
};

function Icon({ name }: { name: 'user' | 'shield' | 'bell' | 'chevron' | 'upload' | 'check' }) {
  const paths = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.6-3.2 3-5 7-5s6.4 1.8 7 5" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
    chevron: <path d="m7 10 5 5 5-5" />,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4" /><path d="M5 14v5h14v-5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function App() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setNotice('');
  };

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice('Выберите файл изображения.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('avatar', String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaved(true);
    setNotice('Изменения сохранены');
  };

  const cancel = () => {
    setProfile(initialProfile);
    if (fileRef.current) fileRef.current.value = '';
    setSaved(false);
    setNotice('Изменения отменены');
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Главная"><span className="brand-mark">n</span><span>northstar</span></a>
        <div className="topbar-right"><span className="workspace-label">Рабочее пространство</span><span className="top-avatar">АИ</span></div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="side-heading">НАСТРОЙКИ</div>
          <a href="#profile" className="side-link active"><Icon name="user" />Профиль</a>
          <a href="#security" className="side-link"><Icon name="shield" />Безопасность</a>
          <a href="#notifications" className="side-link"><Icon name="bell" />Уведомления</a>
          <div className="sidebar-note"><div className="note-dot" /><div><b>Ваш аккаунт защищён</b><span>Последний вход сегодня, 10:42</span></div></div>
        </aside>

        <section className="content" id="profile">
          <div className="breadcrumb">Настройки <span>/</span> Профиль</div>
          <div className="page-heading"><div><div className="eyebrow">АККАУНТ</div><h1>Профиль</h1><p>Управляйте личной информацией и настройками аккаунта.</p></div></div>

          <div className="settings-card">
            <section className="card-section identity-section">
              <div className="section-title"><div className="section-icon"><Icon name="user" /></div><div><h2>Личная информация</h2><p>Эти данные будут видны участникам вашей команды.</p></div></div>
              <div className="avatar-row">
                <div className="avatar-preview">{profile.avatar ? <img src={profile.avatar} alt="Аватар профиля" /> : <span>АИ</span>}</div>
                <div className="avatar-copy"><strong>Фото профиля</strong><span>JPG, PNG или GIF. Не более 5 МБ.</span></div>
                <button className="button upload-button" type="button" onClick={() => fileRef.current?.click()}><Icon name="upload" />Загрузить фото</button>
                <input ref={fileRef} className="visually-hidden" type="file" accept="image/*" onChange={handleAvatar} />
              </div>
              <div className="form-grid">
                <label className="field"><span>Имя</span><input value={profile.name} onChange={(e) => update('name', e.target.value)} placeholder="Ваше имя" /></label>
                <label className="field"><span>Email</span><input type="email" value={profile.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" /></label>
                <label className="field select-field"><span>Язык интерфейса</span><select value={profile.language} onChange={(e) => update('language', e.target.value)}><option>Русский</option><option>English</option><option>Español</option><option>Deutsch</option><option>Français</option></select><Icon name="chevron" /></label>
                <label className="field select-field"><span>Часовой пояс</span><select value={profile.timezone} onChange={(e) => update('timezone', e.target.value)}><option value="Europe/Moscow">Москва (UTC+3)</option><option value="Europe/London">Лондон (UTC+0)</option><option value="Europe/Berlin">Берлин (UTC+1)</option><option value="Asia/Dubai">Дубай (UTC+4)</option><option value="Asia/Tokyo">Токио (UTC+9)</option><option value="America/New_York">Нью-Йорк (UTC−5)</option><option value="America/Los_Angeles">Лос-Анджелес (UTC−8)</option></select><Icon name="chevron" /></label>
              </div>
            </section>

            <section className="card-section" id="security">
              <div className="section-title"><div className="section-icon lavender"><Icon name="shield" /></div><div><h2>Безопасность</h2><p>Дополнительный уровень защиты вашего аккаунта.</p></div></div>
              <div className="setting-row"><div><strong>Двухфакторная авторизация</strong><span>Запрашивать код при входе с нового устройства</span></div><button className={`switch ${profile.twoFactor ? 'on' : ''}`} type="button" role="switch" aria-checked={profile.twoFactor} aria-label="Двухфакторная авторизация" onClick={() => update('twoFactor', !profile.twoFactor)}><span /></button></div>
            </section>

            <section className="card-section notifications-section" id="notifications">
              <div className="section-title"><div className="section-icon amber"><Icon name="bell" /></div><div><h2>Email-уведомления</h2><p>Выберите, какие письма вы хотите получать.</p></div></div>
              <div className="check-list">
                <label className="check-row"><input type="checkbox" checked={profile.updates} onChange={(e) => update('updates', e.target.checked)} /><span className="custom-check"><Icon name="check" /></span><span><strong>Новости продукта</strong><small>Новые функции и улучшения продукта</small></span></label>
                <label className="check-row"><input type="checkbox" checked={profile.alerts} onChange={(e) => update('alerts', e.target.checked)} /><span className="custom-check"><Icon name="check" /></span><span><strong>Системные алерты</strong><small>Важные события и изменения в аккаунте</small></span></label>
                <label className="check-row"><input type="checkbox" checked={profile.digest} onChange={(e) => update('digest', e.target.checked)} /><span className="custom-check"><Icon name="check" /></span><span><strong>Дайджест за неделю</strong><small>Краткий обзор активности за последние 7 дней</small></span></label>
              </div>
            </section>

            <footer className="card-footer"><span className={`form-message ${notice ? 'visible' : ''}`}>{saved && <span className="saved-check"><Icon name="check" /></span>}{notice}</span><div className="actions"><button className="button cancel-button" type="button" onClick={cancel}>Отмена</button><button className="button save-button" type="button" onClick={save}>Сохранить изменения</button></div></footer>
          </div>
          <div className="page-footnote">Изменения профиля синхронизируются со всеми вашими устройствами.</div>
        </section>
      </div>
    </main>
  );
}
