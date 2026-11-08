import { Card, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { LANGS, LANGUAGE_NAMES } from './i18n/messages';

function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <SegmentedRadioGroup
      size="m"
      value={lang}
      onUpdate={setLang}
      aria-label={t('language')}
      options={LANGS.map((code) => ({ value: code, content: LANGUAGE_NAMES[code] }))}
    />
  );
}

function Page() {
  const { t } = useI18n();

  return (
    <div style={{ padding: 24, maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Text variant="header-2">{t('welcomeTitle')}</Text>
        <LanguageSwitcher />
      </div>

      <Text color="secondary">{t('welcomeText')}</Text>

      <Card view="outlined" size="l">
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Text variant="subheader-2">{t('cardTitle')}</Text>
          <Text variant="body-2">{t('cardText')}</Text>
        </div>
      </Card>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <Page />
    </I18nProvider>
  );
}
