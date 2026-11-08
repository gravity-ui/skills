import { useState } from 'react';
import { Button, Card, Text } from '@gravity-ui/uikit';

import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LanguageProvider, useTranslation } from './i18n/LanguageProvider';

function Counter() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  return (
    <Card view="outlined" size="l" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Text variant="subheader-2">{t('counter.title')}</Text>
      <Text>{t('counter.value', { count })}</Text>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button view="outlined" onClick={() => setCount((c) => c - 1)}>
          {t('counter.decrement')}
        </Button>
        <Button view="outlined" onClick={() => setCount(0)}>
          {t('counter.reset')}
        </Button>
        <Button view="action" onClick={() => setCount((c) => c + 1)}>
          {t('counter.increment')}
        </Button>
      </div>
    </Card>
  );
}

function Page() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Text variant="header-2">{t('app.title')}</Text>
        <LanguageSwitcher />
      </div>
      <Text color="secondary">{t('app.description')}</Text>
      <Counter />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}
