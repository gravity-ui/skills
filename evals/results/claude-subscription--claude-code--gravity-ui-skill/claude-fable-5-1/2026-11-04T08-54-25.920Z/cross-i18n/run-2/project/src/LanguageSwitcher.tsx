import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {LANGS, setLang, t, useAppLang} from './i18n';
import type {Lang} from './i18n';

export function LanguageSwitcher() {
    const lang = useAppLang();

    return (
        <SegmentedRadioGroup<Lang>
            size="m"
            value={lang}
            onUpdate={setLang}
            aria-label={t('label_language')}
        >
            {LANGS.map((value) => (
                <SegmentedRadioGroup.Option key={value} value={value}>
                    {t(`lang_${value}`)}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}
