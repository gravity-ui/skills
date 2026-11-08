import { useEffect, useState } from 'react';
import './App.css';

type Language = 'en' | 'ru';

const copy = {
  en: {
    workspace: 'Workspace',
    overview: 'Overview',
    projects: 'Projects',
    team: 'Team',
    settings: 'Settings',
    pageTitle: 'Workspace settings',
    pageDescription: 'Manage your workspace preferences and make it feel right for you.',
    general: 'General',
    generalDescription: 'Set up the basics for your workspace.',
    workspaceName: 'Workspace name',
    nameHint: 'This is how your workspace appears to your team.',
    languageTitle: 'Language',
    languageDescription: 'Choose the language used across the interface.',
    languageLabel: 'Interface language',
    languageHint: 'You can change this setting at any time.',
    english: 'English',
    russian: 'Русский',
    saved: 'Changes are saved automatically',
    profile: 'Alex Morgan',
    role: 'Workspace admin',
  },
  ru: {
    workspace: 'Рабочее пространство',
    overview: 'Обзор',
    projects: 'Проекты',
    team: 'Команда',
    settings: 'Настройки',
    pageTitle: 'Настройки пространства',
    pageDescription: 'Настройте рабочее пространство так, как удобно вам.',
    general: 'Основное',
    generalDescription: 'Управляйте основными параметрами пространства.',
    workspaceName: 'Название пространства',
    nameHint: 'Так ваше пространство будет отображаться для команды.',
    languageTitle: 'Язык',
    languageDescription: 'Выберите язык интерфейса приложения.',
    languageLabel: 'Язык интерфейса',
    languageHint: 'Язык можно изменить в любое время.',
    english: 'English',
    russian: 'Русский',
    saved: 'Изменения сохраняются автоматически',
    profile: 'Алексей Морозов',
    role: 'Администратор',
  },
} satisfies Record<Language, Record<string, string>>;

function getInitialLanguage(): Language {
  try {
    return window.localStorage.getItem('interface-language') === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem('interface-language', language);
    } catch {
      // The language switch still works when storage is unavailable.
    }
  }, [language]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label={t.workspace}>
          <span className="brand-mark">N</span>
          <span>{t.workspace}</span>
        </a>
        <nav className="navigation" aria-label={t.workspace}>
          <a className="nav-item" href="#overview"><span className="nav-icon">◫</span>{t.overview}</a>
          <a className="nav-item" href="#projects"><span className="nav-icon">▦</span>{t.projects}</a>
          <a className="nav-item" href="#team"><span className="nav-icon">♧</span>{t.team}</a>
          <a className="nav-item active" href="#settings" aria-current="page"><span className="nav-icon">⚙</span>{t.settings}</a>
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{language === 'ru' ? 'АМ' : 'AM'}</div>
          <div className="profile-copy"><strong>{t.profile}</strong><span>{t.role}</span></div>
          <span className="more" aria-hidden="true">···</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>{t.workspace}</span><span className="crumb-separator">/</span><strong>{t.settings}</strong></div>
          <div className="language-switch" role="group" aria-label={t.languageLabel}>
            <button type="button" className={language === 'en' ? 'selected' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
            <button type="button" className={language === 'ru' ? 'selected' : ''} aria-pressed={language === 'ru'} onClick={() => setLanguage('ru')}>RU</button>
          </div>
        </header>

        <section className="settings-page">
          <div className="page-heading">
            <div className="eyebrow">{t.workspace}</div>
            <h1>{t.pageTitle}</h1>
            <p>{t.pageDescription}</p>
          </div>

          <section className="settings-section" aria-labelledby="general-heading">
            <div className="section-heading">
              <h2 id="general-heading">{t.general}</h2>
              <p>{t.generalDescription}</p>
            </div>
            <div className="settings-card">
              <div className="setting-row">
                <div className="setting-copy">
                  <h3>{t.workspaceName}</h3>
                  <p>{t.nameHint}</p>
                </div>
                <input className="text-input" value={language === 'ru' ? 'Команда Нова' : 'Nova workspace'} readOnly aria-label={t.workspaceName} />
              </div>
              <div className="setting-row language-row">
                <div className="setting-copy">
                  <h3>{t.languageTitle}</h3>
                  <p>{t.languageDescription}</p>
                </div>
                <div className="language-control">
                  <label htmlFor="language-select">{t.languageLabel}</label>
                  <select id="language-select" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
                    <option value="en">{t.english}</option>
                    <option value="ru">{t.russian}</option>
                  </select>
                  <span className="select-chevron" aria-hidden="true">⌄</span>
                  <small>{t.languageHint}</small>
                </div>
              </div>
            </div>
            <div className="save-note"><span className="check-icon">✓</span>{t.saved}</div>
          </section>
        </section>
      </main>
    </div>
  );
}
