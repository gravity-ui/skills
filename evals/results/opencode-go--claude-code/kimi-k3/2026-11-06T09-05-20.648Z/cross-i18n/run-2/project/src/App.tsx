import {useState} from 'react';

import {Button, Card, SegmentedRadioGroup, Text, TextArea, TextInput} from '@gravity-ui/uikit';

import {LanguageProvider, useLanguage, type Language} from './i18n';

function LanguageSwitcher() {
    const {language, setLanguage, t} = useLanguage();

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
            <Text variant="body-2" color="secondary">
                {t('languageLabel')}:
            </Text>
            <SegmentedRadioGroup
                size="m"
                value={language}
                onUpdate={(value) => setLanguage(value as Language)}
                options={[
                    {value: 'en', content: `🇬🇧 ${t('english')}`},
                    {value: 'ru', content: `🇷🇺 ${t('russian')}`},
                ]}
            />
        </div>
    );
}

function DemoPage() {
    const {t} = useLanguage();
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [notice, setNotice] = useState<string | null>(null);

    const handleSave = () => setNotice(t('savedMessage'));
    const handleReset = () => {
        setName('');
        setComment('');
        setNotice(t('resetMessage'));
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <Card style={{width: '100%', maxWidth: 520, padding: 32}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
                    <div>
                        <Text variant="header-1" as="h1">
                            {t('appTitle')}
                        </Text>
                        <Text variant="body-2" color="secondary" as="p">
                            {t('subtitle')}
                        </Text>
                    </div>

                    <LanguageSwitcher />

                    <div>
                        <Text variant="subheader-2" as="h2">
                            {t('greeting')}
                        </Text>
                        <Text variant="body-2" as="p">
                            {t('intro')}
                        </Text>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                        <TextInput
                            label={t('nameLabel')}
                            placeholder={t('namePlaceholder')}
                            value={name}
                            onUpdate={setName}
                        />
                        <TextArea
                            placeholder={t('commentPlaceholder')}
                            value={comment}
                            onUpdate={setComment}
                            minRows={3}
                        />
                        <Text variant="caption-2" color="secondary">
                            {t('charactersTyped')}: {name.length + comment.length}
                        </Text>
                    </div>

                    <div style={{display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
                        <Button view="action" onClick={handleSave}>
                            {t('save')}
                        </Button>
                        <Button view="outlined" onClick={handleReset}>
                            {t('reset')}
                        </Button>
                        {notice && (
                            <Text variant="body-1" color="positive">
                                {notice}
                            </Text>
                        )}
                    </div>

                    <Text variant="caption-2" color="hint" as="p">
                        {t('footer')}
                    </Text>
                </div>
            </Card>
        </div>
    );
}

export function App() {
    return (
        <LanguageProvider>
            <DemoPage />
        </LanguageProvider>
    );
}
