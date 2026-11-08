import {Select, ThemeProvider} from '@gravity-ui/uikit';
import {useEffect, useState} from 'react';

import {getInitialLanguage, isLanguage, LANGUAGE_STORAGE_KEY, translations} from './i18n';
import './App.css';

export function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.pageTitle;
  }, [language, t.pageTitle]);

  function changeLanguage(value: string[]) {
    const nextLanguage = value[0];
    if (!isLanguage(nextLanguage)) return;

    setLanguage(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
      setStorageUnavailable(false);
    } catch {
      // Switching remains available when browser storage is blocked.
      setStorageUnavailable(true);
    }
  }

  return (
    <ThemeProvider lang={language} fallbackLang="en">
      <div className="app-shell">
        <header className="app-header">
          <div className="header-content">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">w.</span>
              <span>{t.appName}</span>
            </div>
            <span className="header-section">{t.settings}</span>
          </div>
        </header>

        <main className="settings-page">
          <div className="page-heading">
            <span className="eyebrow">{t.preferences}</span>
            <h1>{t.settings}</h1>
            <p>{t.settingsDescription}</p>
          </div>

          <section className="language-card" aria-labelledby="language-heading">
            <div className="card-heading">
              <span className="language-icon" aria-hidden="true">Aa</span>
              <div>
                <h2 id="language-heading">{t.languageTitle}</h2>
                <p>{t.languageDescription}</p>
              </div>
            </div>

            <div className="language-field">
              <label id="language-label" htmlFor="interface-language">{t.languageLabel}</label>
              <Select
                id="interface-language"
                aria-labelledby="language-label"
                aria-describedby="language-help"
                size="xl"
                width="max"
                value={[language]}
                onUpdate={changeLanguage}
                options={[
                  {value: 'en', content: <span lang="en">English</span>, text: 'English'},
                  {value: 'ru', content: <span lang="ru">Русский</span>, text: 'Русский'},
                ]}
              />
              <p id="language-help" className="field-hint">{t.languageHelp}</p>
            </div>

            <div className="save-status" role="status" aria-live="polite">
              <span className={storageUnavailable ? 'status-dot status-dot-warning' : 'status-dot'} aria-hidden="true" />
              {storageUnavailable ? t.sessionOnly : t.autoSaved}
            </div>
          </section>

          <section className="preview-section" aria-labelledby="preview-heading">
            <div className="preview-heading">
              <h2 id="preview-heading">{t.preview}</h2>
              <span>{language === 'en' ? 'EN' : 'RU'}</span>
            </div>
            <div className="preview-card">
              <span className="welcome-icon" aria-hidden="true">✦</span>
              <h3>{t.welcome}</h3>
              <p>{t.welcomeDescription}</p>
              <div className="preview-tags">
                <span>{t.home}</span>
                <span>{t.projects}</span>
                <span>{t.settings}</span>
              </div>
            </div>
          </section>

          <p className="page-note">{t.deviceNote}</p>
        </main>
      </div>
    </ThemeProvider>
  );
}
