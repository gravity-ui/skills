import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {useMemo} from 'react';

import {i18n, useAppLanguage, type AppLanguage} from './i18n';

export function LanguageSwitcher() {
    const {language, setLanguage} = useAppLanguage();

    const languageOptions = useMemo<Array<{value: AppLanguage; content: string}>>(
        () => [
            {value: 'en', content: i18n('interface', 'language_en')},
            {value: 'ru', content: i18n('interface', 'language_ru')},
        ],
        [language],
    );

    return (
        <SegmentedRadioGroup
            options={languageOptions}
            value={language}
            onUpdate={setLanguage}
            size="m"
            aria-label={i18n('interface', 'choose_language')}
        />
    );
}
