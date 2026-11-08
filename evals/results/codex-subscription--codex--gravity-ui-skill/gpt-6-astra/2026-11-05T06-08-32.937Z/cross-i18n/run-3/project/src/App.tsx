import {useState} from 'react';
import {Select, Text} from '@gravity-ui/uikit';

import {initialLanguage, isLanguage, setLanguage, t} from './i18n';
import './App.css';

export function App() {
  const [language, updateLanguage] = useState(initialLanguage);

  return (
    <main className="settings">
      <Text as="h1" variant="header-1">{t('title')}</Text>
      <Text as="p" variant="body-2" color="secondary">{t('description')}</Text>

      <section className="settings__language" aria-labelledby="language-label">
        <Text as="h2" id="language-label" variant="subheader-2">{t('language')}</Text>
        <Select
          aria-labelledby="language-label"
          aria-describedby="language-hint"
          size="l"
          width="max"
          value={[language]}
          options={[
            {value: 'en', content: <span lang="en">English</span>, text: 'English'},
            {value: 'ru', content: <span lang="ru">Русский</span>, text: 'Русский'},
          ]}
          onUpdate={([value]) => {
            if (isLanguage(value)) {
              setLanguage(value);
              updateLanguage(value);
            }
          }}
        />
        <Text as="p" id="language-hint" variant="body-1" color="secondary">
          {t('hint')}
        </Text>
      </section>
    </main>
  );
}
