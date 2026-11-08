import {useState} from 'react';
import {Box, Button, Card, Flex, Pagination, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {i18n, setLang, type AppLang} from './i18n';
import {useLang} from './useLang';

const LANG_OPTIONS: {value: AppLang; content: string}[] = [
  {value: 'en', content: 'English'},
  {value: 'ru', content: 'Русский'},
];

export function App() {
  const lang = useLang();
  const [count, setCount] = useState(1);
  const [page, setPage] = useState(1);

  return (
    <Flex direction="column" gap={6} style={{maxWidth: 640, margin: '0 auto', padding: 24}}>
      <Flex direction="column" gap={1}>
        <Text variant="header-1">{i18n('page_title')}</Text>
        <Text variant="body-2" color="secondary">
          {i18n('page_subtitle')}
        </Text>
      </Flex>

      <Card view="outlined" style={{padding: 16}}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">{i18n('language_label')}</Text>
          <SegmentedRadioGroup
            aria-label={i18n('language_label')}
            value={lang}
            options={LANG_OPTIONS}
            onUpdate={(value) => setLang(value)}
          />
          <Text variant="caption-2" color="secondary">
            {i18n('current_lang')}
          </Text>
        </Flex>
      </Card>

      <Card view="outlined" style={{padding: 16}}>
        <Flex direction="column" gap={3}>
          <Text variant="body-2">{i18n('greeting', {name: i18n('greeting_name')})}</Text>

          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">{i18n('counter_label')}</Text>
            <Text variant="body-2">{i18n('items_count', {count})}</Text>
            <Flex gap={2}>
              <Button view="action" onClick={() => setCount((c) => c + 1)}>
                {i18n('counter_add')}
              </Button>
              <Button view="outlined" disabled={count === 0} onClick={() => setCount((c) => c - 1)}>
                {i18n('counter_remove')}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Card>

      <Box>
        <Flex direction="column" gap={3}>
          <Text variant="body-2" color="secondary">
            {i18n('uikit_note')}
          </Text>
          <Pagination
            page={page}
            pageSize={10}
            total={95}
            compact={false}
            onUpdate={(nextPage) => setPage(nextPage)}
          />
        </Flex>
      </Box>
    </Flex>
  );
}
