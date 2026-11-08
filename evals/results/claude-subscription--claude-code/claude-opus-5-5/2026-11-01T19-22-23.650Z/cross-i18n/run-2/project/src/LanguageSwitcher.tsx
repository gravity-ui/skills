import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {useTranslation} from './i18n/LanguageProvider';
import {LANGUAGE_NAMES, SUPPORTED_LANGUAGES, isLanguage} from './i18n/translations';

export function LanguageSwitcher() {
    const {lang, setLang, t} = useTranslation();

    return (
        <SegmentedRadioGroup
            aria-label={t('language.label')}
            value={lang}
            onUpdate={(value) => {
                if (isLanguage(value)) {
                    setLang(value);
                }
            }}
        >
            {SUPPORTED_LANGUAGES.map((code) => (
                <SegmentedRadioGroup.Option key={code} value={code}>
                    <span lang={code}>{LANGUAGE_NAMES[code]}</span>
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}
