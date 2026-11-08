import * as React from 'react';
import {Button, Card, Flex, Pagination, Text, TextInput} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './LanguageSwitcher';
import {LanguageProvider, useTranslation} from './i18n/LanguageProvider';

function Content() {
    const {t} = useTranslation();
    const [name, setName] = React.useState('');
    const [submittedName, setSubmittedName] = React.useState<string | null>(null);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmittedName(name.trim());
    };

    return (
        <Flex direction="column" gap={6} style={{padding: 24, maxWidth: 720}}>
            <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap>
                <Flex direction="column" gap={2}>
                    <Text as="h1" variant="header-2">
                        {t('app.title')}
                    </Text>
                    <Text color="secondary">{t('app.subtitle')}</Text>
                </Flex>
                <Flex direction="column" gap={1}>
                    <Text variant="caption-2" color="secondary">
                        {t('language.label')}
                    </Text>
                    <LanguageSwitcher />
                </Flex>
            </Flex>

            <Card view="outlined" style={{padding: 16}}>
                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap={3}>
                        <Text as="h2" variant="subheader-2">
                            {t('form.title')}
                        </Text>
                        <TextInput
                            label={t('form.nameLabel')}
                            placeholder={t('form.namePlaceholder')}
                            value={name}
                            onUpdate={setName}
                            hasClear
                        />
                        <div>
                            <Button type="submit" view="action">
                                {t('form.submit')}
                            </Button>
                        </div>
                        {submittedName !== null && (
                            <Text role="status">
                                {submittedName
                                    ? t('form.greeting', {name: submittedName})
                                    : t('form.greetingAnonymous')}
                            </Text>
                        )}
                    </Flex>
                </form>
            </Card>

            <Card view="outlined" style={{padding: 16}}>
                <Flex direction="column" gap={3}>
                    <Text as="h2" variant="subheader-2">
                        {t('pagination.title')}
                    </Text>
                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={250}
                        pageSizeOptions={[10, 20, 50]}
                        compact={false}
                        showInput
                        onUpdate={(nextPage, nextPageSize) => {
                            setPage(nextPage);
                            setPageSize(nextPageSize);
                        }}
                    />
                    <Text color="secondary">{t('pagination.currentPage', {page})}</Text>
                </Flex>
            </Card>
        </Flex>
    );
}

export function App() {
    return (
        <LanguageProvider>
            <Content />
        </LanguageProvider>
    );
}
