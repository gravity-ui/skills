import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { SUPPORTED_LANGS, setLang, useAppLang, useTranslation } from '.';
import type { AppLang } from '.';

// Language names are shown in their own language so users can always find theirs.
const LANG_NAMES: Record<AppLang, string> = {
    en: 'English',
    ru: 'Русский',
};

export function LanguageSwitcher() {
    const lang = useAppLang();
    const t = useTranslation('app');

    return (
        <SegmentedRadioGroup<AppLang> aria-label={t('language-label')} value={lang} onUpdate={setLang}>
            {SUPPORTED_LANGS.map((value) => (
                <SegmentedRadioGroup.Option key={value} value={value}>
                    {LANG_NAMES[value]}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}
