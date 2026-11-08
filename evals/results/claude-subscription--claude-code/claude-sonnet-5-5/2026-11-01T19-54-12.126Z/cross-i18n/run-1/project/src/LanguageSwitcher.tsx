import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useI18n, type Lang } from './i18n';

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <SegmentedRadioGroup
      aria-label={t('switchLanguage')}
      value={lang}
      onUpdate={(value) => setLang(value as Lang)}
    >
      <SegmentedRadioGroup.Option value="en" content={t('langEn')} />
      <SegmentedRadioGroup.Option value="ru" content={t('langRu')} />
    </SegmentedRadioGroup>
  );
}
