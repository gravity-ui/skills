import { useEffect, useState } from 'react';
import './App.css';

type Language = 'en' | 'ru';

const copy = {
  en: {
    workspace: 'Workspace', overview: 'Overview', projects: 'Projects', team: 'Team',
    settings: 'Settings', preferences: 'Preferences', account: 'Account',
    help: 'Help center', settingsTitle: 'Settings', settingsSub: 'Make your workspace feel like yours.',
    general: 'General', generalSub: 'Manage your personal workspace preferences.',
    language: 'Language', languageSub: 'Choose the language you want to use across the app.',
    english: 'English', russian: 'Russian', recommended: 'Recommended',
    timezone: 'Time zone', timezoneSub: 'Used for dates and activity timestamps.',
    timezoneValue: 'Europe / London (UTC+00:00)', dateFormat: 'Date format',
    dateFormatSub: 'Choose how dates appear throughout the app.', dateFormatValue: 'DD / MM / YYYY',
    saved: 'Your changes are saved automatically', profile: 'Olivia Rhye', role: 'Workspace admin',
    preview: 'Language preview', previewSub: 'Your interface will look like this',
    welcome: 'Good morning, Olivia', today: 'Here’s what’s happening in your workspace today.',
    tasks: 'Tasks completed', activeProjects: 'Active projects',
  },
  ru: {
    workspace: 'Рабочее пространство', overview: 'Обзор', projects: 'Проекты', team: 'Команда',
    settings: 'Настройки', preferences: 'Предпочтения', account: 'Аккаунт',
    help: 'Центр помощи', settingsTitle: 'Настройки', settingsSub: 'Настройте рабочее пространство под себя.',
    general: 'Общие', generalSub: 'Управляйте личными настройками рабочего пространства.',
    language: 'Язык', languageSub: 'Выберите язык, который будет использоваться в приложении.',
    english: 'Английский', russian: 'Русский', recommended: 'Рекомендуется',
    timezone: 'Часовой пояс', timezoneSub: 'Используется для дат и времени активности.',
    timezoneValue: 'Европа / Лондон (UTC+00:00)', dateFormat: 'Формат даты',
    dateFormatSub: 'Выберите отображение дат в приложении.', dateFormatValue: 'ДД / ММ / ГГГГ',
    saved: 'Изменения сохраняются автоматически', profile: 'Оливия Рай', role: 'Администратор',
    preview: 'Предпросмотр языка', previewSub: 'Так будет выглядеть интерфейс',
    welcome: 'Доброе утро, Оливия', today: 'Вот что сегодня происходит в рабочем пространстве.',
    tasks: 'Выполнено задач', activeProjects: 'Активные проекты',
  },
} as const;

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    folder: 'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
    sliders: 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M2 14h4 M10 8h4 M18 16h4',
    help: 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z',
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('interface-language');
    if (stored === 'en' || stored === 'ru') return stored;
    return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
  });
  const t = copy[language];

  useEffect(() => {
    localStorage.setItem('interface-language', language);
    document.documentElement.lang = language;
    document.title = language === 'ru' ? 'Настройки — Workspace' : 'Settings — Workspace';
  }, [language]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><span /></span><span>orbit<span className="brand-dot">.</span></span></div>
        <div className="workspace-switch"><div className="workspace-avatar">A</div><div className="workspace-info"><strong>{t.workspace}</strong><span>Acme Inc.</span></div><span className="chevrons">⌄</span></div>
        <div className="nav-label">{t.workspace}</div>
        <nav className="main-nav" aria-label={t.workspace}>
          <a href="#overview"><Icon name="grid" />{t.overview}</a>
          <a href="#projects"><Icon name="folder" />{t.projects}<span className="nav-count">8</span></a>
          <a href="#team"><Icon name="users" />{t.team}</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="nav-label">{t.account}</div>
          <nav className="main-nav" aria-label={t.account}>
            <a className="active" href="#settings"><Icon name="sliders" />{t.settings}</a>
            <a href="#help"><Icon name="help" />{t.help}</a>
          </nav>
          <div className="profile"><div className="profile-avatar">OR</div><div className="profile-info"><strong>{t.profile}</strong><span>{t.role}</span></div><span className="profile-more">···</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumb">{t.settings} <span>/</span> <strong>{t.preferences}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications"><span className="bell">♧</span><i /></button><div className="top-avatar">OR</div></div></header>
        <div className="content-wrap">
          <div className="page-heading"><div><div className="eyebrow">{t.workspace.toUpperCase()}</div><h1>{t.settingsTitle}</h1><p>{t.settingsSub}</p></div><div className="heading-tag"><span className="status-dot" />{t.saved}</div></div>
          <div className="settings-layout">
            <nav className="settings-nav" aria-label={t.settings}>
              <div className="settings-nav-title">{t.settings}</div>
              <a className="selected" href="#general">{t.general}</a>
              <a href="#account">{t.account}</a>
              <a href="#notifications">{language === 'ru' ? 'Уведомления' : 'Notifications'}</a>
              <a href="#billing">{language === 'ru' ? 'Оплата' : 'Billing'}</a>
            </nav>
            <section className="settings-content" id="general">
              <div className="section-heading"><div><h2>{t.general}</h2><p>{t.generalSub}</p></div><div className="section-icon"><Icon name="sliders" /></div></div>
              <div className="setting-row language-row"><div className="setting-copy"><h3>{t.language}</h3><p>{t.languageSub}</p></div><div className="language-control" role="group" aria-label={t.language}>
                <button type="button" className={language === 'en' ? 'language-option chosen' : 'language-option'} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}><span className="flag">🇬🇧</span><span>{t.english}</span>{language === 'en' && <span className="check">✓</span>}</button>
                <button type="button" className={language === 'ru' ? 'language-option chosen' : 'language-option'} onClick={() => setLanguage('ru')} aria-pressed={language === 'ru'}><span className="flag">🇷🇺</span><span>{t.russian}</span>{language === 'ru' && <span className="check">✓</span>}</button>
              </div></div>
              <div className="setting-row"><div className="setting-copy"><h3>{t.timezone}</h3><p>{t.timezoneSub}</p></div><button className="select-control" type="button"><span className="globe">◎</span>{t.timezoneValue}<span className="select-chevron">⌄</span></button></div>
              <div className="setting-row last-row"><div className="setting-copy"><h3>{t.dateFormat}</h3><p>{t.dateFormatSub}</p></div><button className="select-control date-select" type="button">{t.dateFormatValue}<span className="select-chevron">⌄</span></button></div>
              <div className="preview-card"><div className="preview-head"><div><h3>{t.preview}</h3><p>{t.previewSub}</p></div><div className="preview-lang"><span>{language.toUpperCase()}</span><span className="preview-chevron">⌄</span></div></div><div className="preview-window"><div className="preview-window-top"><span className="mini-brand"><span className="brand-mark small"><span /></span>orbit<span className="brand-dot">.</span></span><span className="preview-lines"><i /><i /><b /></span></div><div className="preview-welcome"><span className="preview-greeting">{t.welcome} <span>✦</span></span><span className="preview-description">{t.today}</span></div><div className="preview-stats"><div><span>{t.tasks}</span><strong>24 <small>+12%</small></strong><i className="sparkline spark-one" /></div><div><span>{t.activeProjects}</span><strong>08 <small>+2</small></strong><i className="sparkline spark-two" /></div></div></div></div>
            </section>
          </div>
          <footer className="page-footer"><span>© 2024 Orbit, Inc.</span><a href="#privacy">{language === 'ru' ? 'Конфиденциальность' : 'Privacy'}</a><a href="#terms">{language === 'ru' ? 'Условия' : 'Terms'}</a><a href="#status"><span className="status-dot" />{language === 'ru' ? 'Все системы работают' : 'All systems operational'}</a></footer>
        </div>
      </main>
    </div>
  );
}
