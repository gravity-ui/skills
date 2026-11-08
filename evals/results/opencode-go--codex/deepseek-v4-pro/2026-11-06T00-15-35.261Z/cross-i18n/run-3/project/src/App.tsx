import {Card, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import {LANGUAGE_OPTIONS, LanguageProvider, useLanguage, type Language} from './i18n';

function LanguageSettings() {
    const {language, setLanguage, t} = useLanguage();
    const currentLanguage = language === 'en' ? t.english : t.russian;

    return (
        <div style={{maxWidth: 640, margin: '0 auto', padding: 24}}>
            <Text as="h1" variant="display-1">
                {t.title}
            </Text>
            <Text color="secondary" variant="body-2" style={{display: 'block', marginTop: 8}}>
                {t.description}
            </Text>

            <Card view="outlined" size="l" style={{marginTop: 24, padding: 20}}>
                <Text as="label" variant="subheader-2" style={{display: 'block', marginBottom: 12}}>
                    {t.languageLabel}
                </Text>
                <SegmentedRadioGroup<Language>
                    aria-label={t.languageLabel}
                    value={language}
                    onUpdate={(value) => setLanguage(value as Language)}
                    options={LANGUAGE_OPTIONS}
                    width="max"
                />
            </Card>

            <Card view="filled" size="l" style={{marginTop: 16, padding: 20}}>
                <Text variant="caption-1" color="hint">
                    {t.currentLanguage}
                </Text>
                <Text variant="subheader-1" style={{display: 'block', marginTop: 4}}>
                    {currentLanguage}
                </Text>

                <Text as="h2" variant="header-1" style={{marginTop: 24}}>
                    {t.sampleTitle}
                </Text>
                <Text variant="body-1" style={{display: 'block', marginTop: 8}}>
                    {t.sampleText}
                </Text>
            </Card>
        </div>
    );
}

export function App() {
    return (
        <LanguageProvider>
            <LanguageSettings />
        </LanguageProvider>
    );
}
