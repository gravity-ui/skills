import {Lang, SegmentedRadioGroup} from '@gravity-ui/uikit';

import type {AppLang} from './i18n';
import {useAppLang} from './i18n/LangProvider';

// Language names are shown in their own language, so they never get translated.
const LANG_OPTIONS: {value: AppLang; content: string}[] = [
    {value: Lang.En, content: 'English'},
    {value: Lang.Ru, content: 'Русский'},
];

export function LanguageSwitcher() {
    const {lang, setLang, t} = useAppLang();

    return (
        <SegmentedRadioGroup<AppLang>
            aria-label={t('app', 'label_language-switcher')}
            value={lang}
            onUpdate={setLang}
            options={LANG_OPTIONS}
        />
    );
}
