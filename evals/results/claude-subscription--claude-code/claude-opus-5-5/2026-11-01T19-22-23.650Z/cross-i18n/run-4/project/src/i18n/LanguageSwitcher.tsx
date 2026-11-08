import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {useI18n} from './I18nProvider';
import {LANGUAGES, type Language} from './translations';

export function LanguageSwitcher() {
    const {lang, setLang, t} = useI18n();

    return (
        <SegmentedRadioGroup<Language>
            aria-label={t('language.label')}
            value={lang}
            onUpdate={setLang}
            options={LANGUAGES.map((code) => ({value: code, content: t(`language.${code}`)}))}
        />
    );
}
