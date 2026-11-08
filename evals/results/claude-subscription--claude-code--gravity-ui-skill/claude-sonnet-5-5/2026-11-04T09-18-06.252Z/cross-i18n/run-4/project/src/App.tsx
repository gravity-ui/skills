import React from 'react';
import {Button, Card, Flex, Pagination, Select, SegmentedRadioGroup, Text, TextInput} from '@gravity-ui/uikit';

import {LANGS, langLabel, useLang} from './i18n';

export function App() {
  const {lang, setLang, t} = useLang();
  const [name, setName] = React.useState('');
  const [count, setCount] = React.useState(0);
  const [fruit, setFruit] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);

  return (
    <Flex direction="column" gap={5} style={{padding: 24, maxWidth: 560}}>
      <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
        <Text variant="header-1">{t('title')}</Text>
        <SegmentedRadioGroup
          aria-label={t('language')}
          value={lang}
          onUpdate={(value) => setLang(value)}
        >
          {LANGS.map((code) => (
            <SegmentedRadioGroup.Option key={code} value={code}>
              {langLabel(code)}
            </SegmentedRadioGroup.Option>
          ))}
        </SegmentedRadioGroup>
      </Flex>

      <Text color="secondary">{t('description')}</Text>

      <Card view="outlined" type="container">
        <Flex direction="column" gap={4} style={{padding: 16}}>
          <TextInput
            label={t('name_label')}
            placeholder={t('name_placeholder')}
            value={name}
            onUpdate={setName}
            hasClear
          />
          <Text variant="subheader-2">
            {name.trim() ? t('greeting', {name: name.trim()}) : t('greeting_anonymous')}
          </Text>

          <Flex alignItems="center" gap={3} wrap>
            <Text style={{minWidth: 0, flex: 1}}>{t('items', {count})}</Text>
            <Button view="action" onClick={() => setCount((c) => c + 1)} style={{flexShrink: 0}}>
              {t('add')}
            </Button>
            <Button
              view="outlined"
              disabled={count === 0}
              onClick={() => setCount(0)}
              style={{flexShrink: 0}}
            >
              {t('reset')}
            </Button>
          </Flex>

          <Select
            label={t('select_label')}
            placeholder={t('select_placeholder')}
            value={fruit}
            onUpdate={setFruit}
            filterable
            hasClear
            width="max"
            options={[
              {value: 'apple', content: t('fruit_apple')},
              {value: 'banana', content: t('fruit_banana')},
              {value: 'cherry', content: t('fruit_cherry')},
            ]}
          />
        </Flex>
      </Card>

      <Flex direction="column" gap={2}>
        <Text color="secondary">{t('pagination_hint')}</Text>
        <Pagination
          page={page}
          pageSize={10}
          total={100}
          compact={false}
          onUpdate={(nextPage) => setPage(nextPage)}
        />
      </Flex>
    </Flex>
  );
}
