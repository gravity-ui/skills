import {useEffect, useState} from 'react';
import {configure, Select, ThemeProvider} from '@gravity-ui/uikit';

import {getInitialLanguage, isLanguage, LANGUAGE_STORAGE_KEY, messages} from './i18n';
import './App.css';

export function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [saved, setSaved] = useState(true);
  const t = messages[language];

  useEffect(() => {
    configure({lang: language});
    document.documentElement.lang = language;
    document.title = messages[language].pageTitle;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setSaved(true);
    } catch {
      // Language switching still works if browser storage is unavailable.
      setSaved(false);
    }
  }, [language]);

  return (
    <ThemeProvider lang={language}>
      <main className="settings-page">
        <header className="settings-header">
          <span className="settings-eyebrow">{t.preferences}</span>
          <h1>{t.heading}</h1>
          <p>{t.description}</p>
        </header>

        <section className="language-card" aria-labelledby="language-heading">
          <div className="language-card-heading">
            <span className="language-symbol" aria-hidden="true">Aa</span>
            <div>
              <h2 id="language-heading">{t.languageHeading}</h2>
              <p>{t.languageDescription}</p>
            </div>
          </div>

          <div className="language-field">
            <label id="language-label" htmlFor="interface-language">{t.languageLabel}</label>
            <Select
              id="interface-language"
              aria-labelledby="language-label"
              size="xl"
              width="max"
              value={[language]}
              options={[
                {value: 'en', content: 'English'},
                {value: 'ru', content: 'Русский'},
              ]}
              onUpdate={([value]) => {
                if (isLanguage(value)) setLanguage(value);
              }}
            />
            <p className="language-hint">{t.hint}</p>
          </div>

          <div className="language-status" role="status">
            <span aria-hidden="true">{saved ? '✓' : 'ⓘ'}</span>
            <span>{saved ? t.saved : t.sessionOnly}</span>
          </div>
        </section>
        <p className="settings-footer">{t.footer}</p>
      </main>
    </ThemeProvider>
  );
}
