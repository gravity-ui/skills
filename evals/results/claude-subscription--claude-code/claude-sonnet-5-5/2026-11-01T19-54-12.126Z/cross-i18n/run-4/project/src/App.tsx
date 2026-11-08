import { Text } from '@gravity-ui/uikit';

import { LanguageSwitcher } from './i18n/LanguageSwitcher';
import { useI18n } from './i18n/I18nProvider';

export function App() {
  const { t, language } = useI18n();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <Text variant="header-1" as="h1">
        {t('app.title')}
      </Text>
      <Text variant="body-2" color="secondary">
        {t('app.description')}
      </Text>
      <LanguageSwitcher />
      <Text variant="body-1">{t('app.current', { language: t(`language.${language}`) })}</Text>
    </div>
  );
}
