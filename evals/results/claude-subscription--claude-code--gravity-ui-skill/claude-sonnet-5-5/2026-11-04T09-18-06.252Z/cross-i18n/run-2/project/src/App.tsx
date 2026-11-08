import { ClipboardButton, Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { LANGS, useI18n } from './i18n';
import type { AppLang } from './i18n';

export function App() {
  const { lang, setLang, t } = useI18n();

  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 520 }}>
      <Text variant="header-1">{t('title')}</Text>
      <Text variant="body-2" color="secondary">
        {t('description')}
      </Text>

      <SegmentedRadioGroup<AppLang>
        aria-label={t('switcher_label')}
        value={lang}
        onUpdate={setLang}
      >
        {LANGS.map((code) => (
          <SegmentedRadioGroup.Option key={code} value={code}>
            {t(code === 'en' ? 'language_en' : 'language_ru')}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>

      <Text variant="body-2">
        {t('current', { language: t(lang === 'en' ? 'language_en' : 'language_ru') })}
      </Text>

      <Text variant="body-2" color="secondary">
        {t('copy_hint')}
      </Text>
      <div>
        <ClipboardButton text={t('title')} size="m" />
      </div>
    </Flex>
  );
}
