import React from 'react';
import {Button, Flex, SegmentedRadioGroup, Text, TextInput} from '@gravity-ui/uikit';

import {useLanguage, useTranslation} from './i18n';
import type {AppLang} from './i18n';

export function App() {
  const t = useTranslation();
  const {lang, setLang} = useLanguage();
  const [name, setName] = React.useState('');
  const [count, setCount] = React.useState(0);

  return (
    <Flex direction="column" gap={4} style={{padding: 24, maxWidth: 480}}>
      <Flex direction="column" gap={1}>
        <Text variant="header-1">{t('title')}</Text>
        <Text variant="body-1" color="secondary">
          {t('description')}
        </Text>
      </Flex>

      <Flex direction="column" gap={2}>
        <Text variant="subheader-1">{t('language_label')}</Text>
        <SegmentedRadioGroup<AppLang>
          value={lang}
          onUpdate={setLang}
          aria-label={t('language_label')}
        >
          <SegmentedRadioGroup.Option value="en">{t('lang_en')}</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="ru">{t('lang_ru')}</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </Flex>

      <TextInput
        label={t('name_label')}
        placeholder={t('name_placeholder')}
        value={name}
        onUpdate={setName}
        hasClear
      />
      <Text variant="body-2">
        {name.trim() ? t('greeting', {name: name.trim()}) : t('greeting_anonymous')}
      </Text>

      <Flex alignItems="center" gap={2}>
        <Button view="action" onClick={() => setCount((c) => c + 1)}>
          {t('add')}
        </Button>
        <Button view="flat" onClick={() => setCount(0)} disabled={count === 0}>
          {t('reset')}
        </Button>
        <Text variant="body-1" style={{flex: 1, minWidth: 0}}>
          {t('items_count', {count})}
        </Text>
      </Flex>
    </Flex>
  );
}
