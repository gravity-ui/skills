import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {type AppLang, SUPPORTED_LANGS, setAppLang, t, useAppLang} from '../i18n';

const LANG_LABELS: Record<AppLang, string> = {
    en: 'English',
    ru: 'Русский',
};

export interface LanguageSwitcherProps {
    size?: 's' | 'm' | 'l' | 'xl';
}

export function LanguageSwitcher({size = 'm'}: LanguageSwitcherProps) {
    const lang = useAppLang();

    return (
        <SegmentedRadioGroup<AppLang>
            name="interface-language"
            size={size}
            value={lang}
            onUpdate={setAppLang}
            aria-label={t('label_language')}
        >
            {SUPPORTED_LANGS.map((value) => (
                <SegmentedRadioGroup.Option key={value} value={value}>
                    {LANG_LABELS[value]}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}
