import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { LANGS, type Lang, useI18n } from './i18n';

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();

  return (
    <SegmentedRadioGroup<Lang>
      value={lang}
      onUpdate={setLang}
      aria-label={t('language.label')}
      qa="language-switcher"
      size="m"
    >
      {LANGS.map((code) => (
        <SegmentedRadioGroup.Option key={code} value={code}>
          {t(`language.${code}`)}
        </SegmentedRadioGroup.Option>
      ))}
    </SegmentedRadioGroup>
  );
}
