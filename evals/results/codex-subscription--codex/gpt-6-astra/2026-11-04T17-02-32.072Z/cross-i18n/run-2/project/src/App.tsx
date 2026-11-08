import {useEffect, useState} from 'react';
import {configure, SegmentedRadioGroup, ThemeProvider} from '@gravity-ui/uikit';
import {getInitialLanguage, languageStorageKey, messages, type Language} from './i18n';
import './App.css';

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = messages[language];

  useEffect(() => {
    configure({lang: language, fallbackLang: 'en'});
    document.documentElement.lang = language;
    document.title = t.pageTitle;
    try {
      localStorage.setItem(languageStorageKey, language);
    } catch {
      // Switching still works when browser storage is unavailable.
    }
  }, [language, t.pageTitle]);

  return (
    <ThemeProvider lang={language} fallbackLang="en">
      <main className="settings">
        <header className="settings-header">
          <div className="settings-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <ellipse cx="12" cy="12" rx="4" ry="9" />
              <path d="M3 12h18M5 6.5h14M5 17.5h14" />
            </svg>
          </div>
          <p className="eyebrow">{t.preferences}</p>
          <h1>{t.title}</h1>
          <p className="settings-description">{t.description}</p>
        </header>

        <section className="language-panel" aria-labelledby="language-heading">
          <div className="language-row">
            <div>
              <h2 id="language-heading">{t.interfaceLanguage}</h2>
              <p className="secondary-text">{t.languageHint}</p>
            </div>
            <SegmentedRadioGroup<Language>
              name="interface-language"
              size="l"
              value={language}
              onUpdate={setLanguage}
              aria-labelledby="language-heading"
              options={[
                {value: 'en', content: <span lang="en">English</span>},
                {value: 'ru', content: <span lang="ru">Русский</span>},
              ]}
            />
          </div>
          <div className="language-note">
            <span className="status-dot" aria-hidden="true" />
            {t.immediateChanges}
          </div>
        </section>

        <section className="preview" aria-labelledby="preview-heading" aria-live="polite" aria-atomic="true">
          <div className="preview-header">
            <h2 id="preview-heading" className="eyebrow">{t.preview}</h2>
            <span className="language-code">{language.toUpperCase()}</span>
          </div>
          <h3>{t.welcome}</h3>
          <p className="secondary-text">{t.previewDescription}</p>
          <div className="preview-footer">
            <span>{t.currentLanguage}</span>
            <strong>{t.languageName}</strong>
          </div>
        </section>
        <p className="settings-footer">{t.footer}</p>
      </main>
    </ThemeProvider>
  );
}
