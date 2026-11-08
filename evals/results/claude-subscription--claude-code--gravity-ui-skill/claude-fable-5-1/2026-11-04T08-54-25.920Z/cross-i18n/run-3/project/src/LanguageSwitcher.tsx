import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {SUPPORTED_LANGS, i18n, isAppLang} from './i18n';
import {useLang} from './i18n/LangProvider';

export function LanguageSwitcher() {
    const {lang, setLang} = useLang();

    return (
        <SegmentedRadioGroup
            size="m"
            value={lang}
            aria-label={i18n('label_language')}
            onUpdate={(value) => {
                if (isAppLang(value)) {
                    setLang(value);
                }
            }}
        >
            {SUPPORTED_LANGS.map((code) => (
                <SegmentedRadioGroup.Option key={code} value={code}>
                    {i18n(`lang_${code}`)}
                </SegmentedRadioGroup.Option>
            ))}
        </SegmentedRadioGroup>
    );
}
