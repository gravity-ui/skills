import { useEffect, useState } from 'react';
import './App.css';

type Language = 'en' | 'ru';

const copy = {
  en: {
    eyebrow: 'PREFERENCES',
    title: 'Language',
    subtitle: 'Choose the language you want to use across the app.',
    section: 'Display language',
    current: 'Current language',
    english: 'English',
    russian: 'Russian',
    preview: 'A quick preview',
    welcome: 'Everything in your language.',
    description: 'Menus, buttons, and helpful messages will appear in English.',
    note: 'Your choice is saved automatically on this device.',
    save: 'Saved',
  },
  ru: {
    eyebrow: 'НАСТРОЙКИ',
    title: 'Язык',
    subtitle: 'Выберите язык, на котором будет отображаться приложение.',
    section: 'Язык интерфейса',
    current: 'Текущий язык',
    english: 'Английский',
    russian: 'Русский',
    preview: 'Предварительный просмотр',
    welcome: 'Всё на вашем языке.',
    description: 'Меню, кнопки и подсказки будут отображаться на русском.',
    note: 'Выбор автоматически сохранится на этом устройстве.',
    save: 'Сохранено',
  },
} satisfies Record<Language, Record<string, string>>;

function getInitialLanguage(): Language {
  try {
    return window.localStorage.getItem('app-language') === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'ru' ? 'Язык — Настройки' : 'Language — Settings';
    try {
      window.localStorage.setItem('app-language', language);
    } catch {
      // The interface still works when browser storage is unavailable.
    }
  }, [language]);

  return (
    <main className="page-shell">
      <div className="settings-page">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="Home">
            <span className="brand-mark" aria-hidden="true">g</span>
            <span>gravity</span>
          </a>
          <div className="profile" aria-label={language === 'ru' ? 'Профиль пользователя' : 'User profile'}>
            <span className="avatar">A</span>
            <span className="profile-name">Alex Morgan</span>
            <span className="chevron" aria-hidden="true">⌄</span>
          </div>
        </header>

        <div className="content-layout">
          <aside className="sidebar" aria-label={language === 'ru' ? 'Настройки' : 'Settings'}>
            <div className="sidebar-label">{t.eyebrow}</div>
            <div className="nav-item"><span className="nav-icon">◉</span>{language === 'ru' ? 'Аккаунт' : 'Account'}</div>
            <div className="nav-item active"><span className="nav-icon">◎</span>{t.title}</div>
            <div className="nav-item"><span className="nav-icon">◇</span>{language === 'ru' ? 'Внешний вид' : 'Appearance'}</div>
          </aside>

          <section className="main-content" aria-labelledby="page-title">
            <div className="breadcrumb">{language === 'ru' ? 'Настройки' : 'Settings'} <span>/</span> {t.title}</div>
            <div className="heading-block">
              <h1 id="page-title">{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>

            <section className="settings-card" aria-labelledby="language-heading">
              <div className="card-heading">
                <div>
                  <h2 id="language-heading">{t.section}</h2>
                  <p>{t.current}: <strong>{t[language === 'ru' ? 'russian' : 'english']}</strong></p>
                </div>
                <span className="globe" aria-hidden="true">◎</span>
              </div>

              <div className="language-options" role="group" aria-label={t.section}>
                <button
                  type="button"
                  className={`language-option ${language === 'en' ? 'selected' : ''}`}
                  aria-pressed={language === 'en'}
                  onClick={() => setLanguage('en')}
                >
                  <span className="language-flag" aria-hidden="true">🇬🇧</span>
                  <span className="language-name">{t.english}</span>
                  <span className="language-code">EN</span>
                  <span className="radio" aria-hidden="true">{language === 'en' && <span />}</span>
                </button>
                <button
                  type="button"
                  className={`language-option ${language === 'ru' ? 'selected' : ''}`}
                  aria-pressed={language === 'ru'}
                  onClick={() => setLanguage('ru')}
                >
                  <span className="language-flag" aria-hidden="true">🇷🇺</span>
                  <span className="language-name">{t.russian}</span>
                  <span className="language-code">RU</span>
                  <span className="radio" aria-hidden="true">{language === 'ru' && <span />}</span>
                </button>
              </div>

              <div className="save-note"><span className="check">✓</span>{t.note}</div>
            </section>

            <section className="preview-card" aria-label={t.preview}>
              <div className="preview-copy">
                <div className="preview-label">{t.preview}</div>
                <h2>{t.welcome}</h2>
                <p>{t.description}</p>
              </div>
              <div className="preview-art" aria-hidden="true">
                <span className="art-orbit orbit-one" />
                <span className="art-orbit orbit-two" />
                <span className="art-dot dot-one" />
                <span className="art-dot dot-two" />
                <span className="art-core">あ</span>
              </div>
            </section>
            <footer className="page-footer"><span className="status-dot" />{t.save}</footer>
          </section>
        </div>
      </div>
    </main>
  );
}
