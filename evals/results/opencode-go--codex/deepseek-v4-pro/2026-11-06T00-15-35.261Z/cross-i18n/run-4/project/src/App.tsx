import { useEffect } from 'react';
import { Lang, SegmentedRadioGroup, configure, useLang } from '@gravity-ui/uikit';

const translations: Record<string, { title: string; description: string }> = {
  [Lang.En]: {
    title: 'Interface language',
    description: 'Choose the language of the interface.',
  },
  [Lang.Ru]: {
    title: 'Язык интерфейса',
    description: 'Выберите язык интерфейса.',
  },
};

const languageOptions = [
  { value: Lang.En, content: 'English' },
  { value: Lang.Ru, content: 'Русский' },
];

export function App() {
  const { lang } = useLang();
  const currentLang = lang === Lang.Ru ? Lang.Ru : Lang.En;
  const text = translations[currentLang];

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: '0 0 8px' }}>{text.title}</h1>
      <p style={{ margin: '0 0 16px' }}>{text.description}</p>
      <SegmentedRadioGroup
        aria-label={text.title}
        value={currentLang}
        onUpdate={(value) => configure({ lang: value })}
        options={languageOptions}
      />
    </div>
  );
}
