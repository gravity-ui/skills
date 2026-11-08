import { useEffect, useState } from 'react';
import { SegmentedRadioGroup, ThemeProvider } from '@gravity-ui/uikit';
import { getInitialLanguage, isLanguage, saveLanguage, translations } from './i18n';
import './App.css';

export function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [saved, setSaved] = useState<boolean | null>(null);
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language].title;
    setSaved(saveLanguage(language));
  }, [language]);

  return (
    <ThemeProvider lang={language} fallbackLang="en">
      <div className="app-shell">
        <header className="app-header">
          <span className="app-mark" aria-hidden="true">a<span>·</span></span>
          <span>{t.settings}</span>
          <span className="header-language" lang={language}>{t.languageName}</span>
        </header>

        <main className="settings-page">
          <div className="language-symbol" aria-hidden="true">A<span>Я</span></div>
          <h1>{t.heading}</h1>
          <p className="page-description">{t.description}</p>

          <section className="language-card" aria-labelledby="language-heading">
            <div className="setting-row">
              <div>
                <h2 id="language-heading">{t.language}</h2>
                <p id="language-description">{t.languageDescription}</p>
              </div>
              <SegmentedRadioGroup
                size="xl"
                name="interface-language"
                value={language}
                aria-labelledby="language-heading"
                aria-describedby="language-description"
                onUpdate={(value) => {
                  if (isLanguage(value)) setLanguage(value);
                }}
                options={[
                  { value: 'en', content: <span lang="en">English</span> },
                  { value: 'ru', content: <span lang="ru">Русский</span> },
                ]}
              />
            </div>

            <div className="language-preview">
              <span className="eyebrow">{t.preview}</span>
              <h3>{t.welcome}</h3>
              <p>{t.previewDescription}</p>
              <div className="current-language">
                <span>{t.currentLanguage}</span>
                <span className="language-badge"><span aria-hidden="true" />{t.languageName}</span>
              </div>
            </div>

            <div className="save-status" role="status">
              <span className="status-icon" aria-hidden="true">{saved === false ? '!' : '✓'}</span>
              <span>{t.instant} {saved === null ? '' : saved ? t.saved : t.unsaved}</span>
            </div>
          </section>
          <footer>{t.footer}</footer>
        </main>
      </div>
    </ThemeProvider>
  );
}
