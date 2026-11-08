import {Box, Flex, Text} from '@gravity-ui/uikit';
import {t, useLang} from './i18n';
import {LanguageSwitcher} from './components/LanguageSwitcher';

export function App() {
  useLang();

  return (
    <Box spacing={{p: 4}}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">{t('welcome')}</Text>
        <Text variant="body-1" color="secondary">
          {t('description')}
        </Text>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-2">{t('switch_language')}</Text>
          <LanguageSwitcher />
        </Flex>
      </Flex>
    </Box>
  );
}
