import { useEffect, useMemo, useState } from 'react';
import { SegmentedRadioGroup, Text, configure } from '@gravity-ui/uikit';

type Language = 'en' | 'ru';

const translations = {
  en: {
    language: 'Language',
    welcome: 'Welcome',
    description: 'Switch the interface between English and Russian.',
  },
  ru: {
    language: 'Язык',
    welcome: 'Добро пожаловать',
    description: 'Переключайте интерфейс между английским и русским языками.',
  },
} satisfies Record<Language, Record<string, string>>;

export function App() {
  const [language, setLanguage] = useState<Language>('en');

  const text = useMemo(() => translations[language], [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    configure({ lang: nextLanguage, fallbackLang: 'en' });
  };

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Text variant="caption-1">{text.language}</Text>
        <SegmentedRadioGroup
          value={language}
          onUpdate={(value) => changeLanguage(value as Language)}
        >
          <SegmentedRadioGroup.Option value="en">English</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="ru">Русский</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </div>

      <Text variant="header-1">{text.welcome}</Text>
      <Text variant="body-1" color="secondary">
        {text.description}
      </Text>
    </div>
  );
}
