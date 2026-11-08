import { useState } from 'react';
import { Button, Card, Text } from '@gravity-ui/uikit';

import { LanguageProvider, useTranslation } from './i18n/LanguageProvider';
import { LanguageSwitcher } from './i18n/LanguageSwitcher';

function Content() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Text variant="header-2">{t('app.title')}</Text>
        <LanguageSwitcher />
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text as="h1" variant="display-1">
          {t('hero.title')}
        </Text>
        <Text as="p" variant="body-2" color="secondary">
          {t('hero.description')}
        </Text>
      </section>

      <Card view="outlined" size="l">
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Text variant="subheader-2">{t('counter.title')}</Text>
          <Text variant="body-2">{t('counter.clicks', { count })}</Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button view="action" onClick={() => setCount((value) => value + 1)}>
              {t('counter.increment')}
            </Button>
            <Button view="outlined" disabled={count === 0} onClick={() => setCount(0)}>
              {t('counter.reset')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <Content />
    </LanguageProvider>
  );
}
