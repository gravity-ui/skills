import {Card, Select, Text} from '@gravity-ui/uikit';

import {isLanguage, useLanguage} from './i18n';
import './App.css';

export function App() {
  const {language, setLanguage, t} = useLanguage();

  return (
    <main className="settings">
      <Text as="h1" variant="header-1" className="settings__title">
        {t('title')}
      </Text>
      <Text as="p" variant="body-2" color="secondary" className="settings__description">
        {t('description')}
      </Text>

      <Card view="outlined" className="settings__card">
        <Text as="h2" variant="subheader-2" className="settings__label" id="language-label">
          {t('language')}
        </Text>
        <Text as="p" variant="body-1" color="secondary" className="settings__hint" id="language-hint">
          {t('languageHint')}
        </Text>
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
          onUpdate={([nextLanguage]) => {
            if (isLanguage(nextLanguage)) setLanguage(nextLanguage);
          }}
        />
        <Text as="p" variant="body-1" color="secondary" className="settings__note" role="status">
          {t('instantUpdate')}
        </Text>
      </Card>
    </main>
  );
}
