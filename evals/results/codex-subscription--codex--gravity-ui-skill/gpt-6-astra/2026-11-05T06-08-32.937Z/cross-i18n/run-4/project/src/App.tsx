import {Select, Text} from '@gravity-ui/uikit';

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

      <section className="settings__section" aria-labelledby="language-heading">
        <Text as="h2" variant="subheader-3" id="language-heading" className="settings__title">
          {t('language')}
        </Text>
        <Text as="p" variant="body-1" color="secondary" className="settings__description">
          {t('languageDescription')}
        </Text>
        <Select
          size="l"
          width="max"
          aria-labelledby="language-heading"
          value={[language]}
          options={[
            {value: 'en', content: 'English'},
            {value: 'ru', content: 'Русский'},
          ]}
          onUpdate={([value]) => {
            if (isLanguage(value)) setLanguage(value);
          }}
        />
        <Text as="p" variant="body-1" color="secondary" aria-live="polite" className="settings__status">
          {t('currentLanguage')}
        </Text>
      </section>
    </main>
  );
}
