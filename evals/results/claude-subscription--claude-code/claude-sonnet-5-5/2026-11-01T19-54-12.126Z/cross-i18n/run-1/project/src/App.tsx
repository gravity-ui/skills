import React from 'react';
import { Flex, Text, TextInput } from '@gravity-ui/uikit';

import { useI18n } from './i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function App() {
  const { t } = useI18n();
  const [name, setName] = React.useState('');

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 480 }}>
      <Flex justifyContent="space-between" alignItems="center" gap={3}>
        <Text variant="header-1">{t('title')}</Text>
        <Flex alignItems="center" gap={2}>
          <Text color="secondary">{t('language')}</Text>
          <LanguageSwitcher />
        </Flex>
      </Flex>
      <Text>{t('description')}</Text>
      <TextInput
        value={name}
        onUpdate={setName}
        placeholder={t('namePlaceholder')}
      />
      <Text variant="subheader-2">
        {name.trim() ? t('greeting', { name: name.trim() }) : t('greetingAnonymous')}
      </Text>
    </Flex>
  );
}
