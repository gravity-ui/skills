import { useCallback, useState } from 'react';
import { Button, Card, Pagination, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { appI18n, getInitialLang, setAppLang, type AppLang } from './i18n';

export function App() {
  const [lang, setLang] = useState<AppLang>(getInitialLang);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const handleLanguageUpdate = useCallback((value: string) => {
    const nextLang: AppLang = value === 'ru' ? 'ru' : 'en';
    setAppLang(nextLang);
    setLang(nextLang);
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <Text variant="header-1">{appI18n('title')}</Text>
        <Text variant="body-1" color="secondary">
          {appI18n('subtitle')}
        </Text>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <Text variant="subheader-2">{appI18n('language_label')}</Text>
        <SegmentedRadioGroup
          value={lang}
          onUpdate={handleLanguageUpdate}
          options={[
            { value: 'en', content: appI18n('english') },
            { value: 'ru', content: appI18n('russian') },
          ]}
        />
      </div>

      <Card view="raised" style={{ padding: 24, display: 'grid', gap: 12 }}>
        <Text variant="header-2">{appI18n('card_title')}</Text>
        <Text variant="body-2">{appI18n('card_body')}</Text>
        <Button view="action" size="l" onClick={() => setCount((value) => value + 1)}>
          {appI18n('action_button')} {count}
        </Button>
      </Card>

      <div style={{ display: 'grid', gap: 8 }}>
        <Text variant="subheader-2">{appI18n('builtin_label')}</Text>
        <Pagination
          page={page}
          pageSize={10}
          total={100}
          compact={false}
          onUpdate={(nextPage) => setPage(nextPage)}
        />
      </div>
    </div>
  );
}
