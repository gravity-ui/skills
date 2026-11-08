import {Globe} from '@gravity-ui/icons';
import {Flex, Icon, SegmentedRadioGroup} from '@gravity-ui/uikit';

import {type AppLang, LANG_LABELS, SUPPORTED_LANGS, isAppLang} from '../i18n';
import {useI18n} from '../i18n/LangProvider';

export interface LanguageSwitcherProps {
  size?: 's' | 'm' | 'l' | 'xl';
}

export function LanguageSwitcher({size = 'm'}: LanguageSwitcherProps) {
  const {lang, setLang, t} = useI18n();

  return (
    <Flex alignItems="center" gap={2}>
      <Icon data={Globe} size={16} style={{flexShrink: 0, color: 'var(--g-color-text-secondary)'}} />
      <SegmentedRadioGroup<AppLang>
        size={size}
        value={lang}
        aria-label={t('language')}
        onUpdate={(value) => {
          if (isAppLang(value)) {
            setLang(value);
          }
        }}
      >
        {SUPPORTED_LANGS.map((code) => (
          <SegmentedRadioGroup.Option<AppLang> key={code} value={code} title={LANG_LABELS[code]}>
            {code.toUpperCase()}
          </SegmentedRadioGroup.Option>
        ))}
      </SegmentedRadioGroup>
    </Flex>
  );
}
