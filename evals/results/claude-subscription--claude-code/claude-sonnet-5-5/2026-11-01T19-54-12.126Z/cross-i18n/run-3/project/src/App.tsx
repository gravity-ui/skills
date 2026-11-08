import React from 'react';
import { Button, Card, Text, TextInput } from '@gravity-ui/uikit';

import { useI18n } from './i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

export function App() {
  const { t, locale } = useI18n();
  const [name, setName] = React.useState('');

  return (
    <div style={{ padding: 24, maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">{t('title')}</Text>
      <Text color="secondary">{t('description')}</Text>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text>{t('language')}:</Text>
        <LanguageSwitcher />
      </div>

      <Text variant="body-1">
        {t('currentLanguage', { language: locale === 'ru' ? t('russian') : t('english') })}
      </Text>

      <Card type="container" view="outlined" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TextInput
            label={t('name')}
            placeholder={t('namePlaceholder')}
            value={name}
            onUpdate={setName}
            hasClear
          />
          <Text variant="subheader-2">
            {name.trim() ? t('greeting', { name: name.trim() }) : t('greetingAnonymous')}
          </Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button view="action">{t('save')}</Button>
            <Button view="flat">{t('cancel')}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
