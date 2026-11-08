import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { LanguageSwitcher } from './LanguageSwitcher';
import { I18nProvider, useI18n } from './i18n/I18nProvider';

export function App() {
  return (
    <I18nProvider>
      <Page />
    </I18nProvider>
  );
}

function Page() {
  const { t } = useI18n();

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
        <Text variant="header-1">{t('title')}</Text>
        <LanguageSwitcher />
      </Flex>

      <Card view="outlined" size="l" spacing={{ mt: 6, p: 6 }}>
        <Flex direction="column" gap={3}>
          <Text as="p" variant="subheader-1">
            {t('subtitle')}
          </Text>
          <Text as="p" variant="body-1" color="secondary">
            {t('description')}
          </Text>
          <Flex gap={2}>
            <Button view="action">{t('save')}</Button>
            <Button view="outlined">{t('cancel')}</Button>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
}
