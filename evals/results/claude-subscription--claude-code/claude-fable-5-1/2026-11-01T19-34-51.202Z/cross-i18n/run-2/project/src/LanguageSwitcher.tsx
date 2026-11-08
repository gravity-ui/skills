import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { SUPPORTED_LANGS, isAppLang, useLocale, type AppLang } from './i18n';

const LANG_NAMES: Record<AppLang, string> = {
  en: 'English',
  ru: 'Русский',
};

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLocale();

  return (
    <SegmentedRadioGroup<AppLang>
      size="m"
      value={lang}
      aria-label={t('lang.label')}
      onUpdate={(next) => {
        if (isAppLang(next)) {
          setLang(next);
        }
      }}
    >
      {SUPPORTED_LANGS.map((code) => (
        <SegmentedRadioGroup.Option key={code} value={code} title={LANG_NAMES[code]}>
          {code.toUpperCase()}
        </SegmentedRadioGroup.Option>
      ))}
    </SegmentedRadioGroup>
  );
}
