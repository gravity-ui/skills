import {useState} from 'react';
import {Card, Select, Text} from '@gravity-ui/uikit';

import {isLanguage, setLanguage, useLanguage} from './i18n';
import './App.css';

export function App() {
  const {language, t} = useLanguage();
  const [changed, setChanged] = useState(false);

  return (
    <main className="settings-page">
      <div className="settings-content">
        <Text as="p" variant="body-2" color="secondary" className="settings-eyebrow">
          {t('preferences')}
        </Text>
        <Text as="h1" variant="header-1" className="settings-title">
          {t('title')}
        </Text>
        <Text as="p" variant="body-2" color="secondary" className="settings-description">
          {t('description')}
        </Text>

        <Card view="outlined" className="language-card">
          <div className="language-heading">
            <Text as="h2" variant="subheader-3" className="language-title">
              {t('languageTitle')}
            </Text>
            <Text as="p" variant="body-1" color="secondary" className="language-description">
              {t('languageDescription')}
            </Text>
          </div>
          <div className="language-field">
            <Text as="label" htmlFor="interface-language" variant="body-2">
              {t('languageLabel')}
            </Text>
            <Select
              id="interface-language"
              aria-label={t('languageLabel')}
              aria-describedby="language-hint"
              size="l"
              width="max"
              value={[language]}
              options={[
                {value: 'en', content: <span lang="en">English</span>, text: 'English'},
                {value: 'ru', content: <span lang="ru">Русский</span>, text: 'Русский'},
              ]}
              onUpdate={([value]) => {
                if (isLanguage(value) && value !== language) {
                  setLanguage(value);
                  setChanged(true);
                }
              }}
            />
            <Text as="p" id="language-hint" variant="body-1" color="secondary" className="language-hint">
              {t('hint')}
            </Text>
          </div>
        </Card>
        <Text as="p" role="status" aria-live="polite" variant="body-1" color="secondary" className="language-status">
          {changed ? t('updated') : ''}
        </Text>
      </div>
    </main>
  );
}
