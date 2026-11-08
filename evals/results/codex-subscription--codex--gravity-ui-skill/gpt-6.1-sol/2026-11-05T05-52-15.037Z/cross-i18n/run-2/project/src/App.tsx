import {useEffect, useState} from 'react';
import {Card, Select, Text} from '@gravity-ui/uikit';

import {applyLanguage, getInitialLanguage, getTranslator, isLanguage} from './i18n';
import './App.css';

export function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const t = getTranslator(language);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  return (
    <div className="app">
      <header className="app-header">
        <Text variant="subheader-2">Gravity UI</Text>
        <Text color="secondary">{t('settings')}</Text>
      </header>

      <main className="settings" aria-labelledby="settings-heading">
        <div className="settings-heading">
          <Text as="h1" id="settings-heading" variant="header-2">{t('title')}</Text>
          <Text as="p" variant="body-2" color="secondary">{t('description')}</Text>
        </div>

        <Card className="language-card" view="outlined">
          <div className="card-heading">
            <Text as="h2" variant="subheader-3">{t('language')}</Text>
            <Text as="p" variant="body-2" color="secondary">{t('languageDescription')}</Text>
          </div>

          <div className="language-field">
            <Text as="label" htmlFor="interface-language" variant="body-2">
              {t('interfaceLanguage')}
            </Text>
            <Select
              id="interface-language"
              aria-label={t('interfaceLanguage')}
              size="l"
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
            <Text as="p" color="secondary">{t('hint')}</Text>
          </div>

          <div className="language-status" role="status" aria-live="polite" aria-atomic="true">
            <span className="status-dot" aria-hidden="true" />
            <Text>{t('currentLanguage')}</Text>
          </div>
        </Card>
      </main>
    </div>
  );
}
