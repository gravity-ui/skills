// Implement the requested feature here (and may add sibling files).
import { Flex, Select } from '@gravity-ui/uikit';

import { useLocalization, type AppLanguage } from './i18n';

export function App() {
  const { language, setLanguage, i18n } = useLocalization();

  const languageOptions: { value: AppLanguage; text: string }[] = [
    { value: 'en', text: i18n.i18n('language', 'english') },
    { value: 'ru', text: i18n.i18n('language', 'russian') },
  ];

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Select<AppLanguage>
        label={i18n.i18n('app', 'language')}
        value={[language]}
        options={languageOptions}
        onUpdate={([nextLanguage]) => {
          if (nextLanguage === 'en' || nextLanguage === 'ru') {
            setLanguage(nextLanguage);
          }
        }}
        width={200}
      />

      <h1>{i18n.i18n('app', 'title')}</h1>
      <p>{i18n.i18n('app', 'description')}</p>
    </Flex>
  );
}
