import * as React from 'react';
import {Button, Card, Flex, Pagination, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

import type {AppLang} from './i18n';
import {LangProvider, useTranslation} from './i18n/LangProvider';

const LANG_OPTIONS: {value: AppLang; content: string}[] = [
    {value: 'en', content: 'English'},
    {value: 'ru', content: 'Русский'},
];

const PAGE_SIZE = 10;
const TOTAL_ITEMS = 120;

function LanguageSwitcher() {
    const {lang, setLang, t} = useTranslation();

    return (
        <Flex alignItems="center" gap={2} wrap style={{flexShrink: 0}}>
            <Text color="secondary" id="language-switcher-label">
                {t('language_label')}
            </Text>
            <SegmentedRadioGroup<AppLang>
                name="lang"
                value={lang}
                onUpdate={setLang}
                options={LANG_OPTIONS}
                aria-labelledby="language-switcher-label"
            />
        </Flex>
    );
}

function AppContent() {
    const {t} = useTranslation();
    const [tasks, setTasks] = React.useState(1);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(PAGE_SIZE);

    return (
        <Flex direction="column" gap={6} style={{padding: 'var(--g-spacing-6)', maxWidth: 960}}>
            <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                    <Text variant="header-1">{t('title')}</Text>
                    <Text color="secondary">{t('subtitle')}</Text>
                </Flex>
                <LanguageSwitcher />
            </Flex>

            <Card type="container" view="outlined" style={{padding: 'var(--g-spacing-5)'}}>
                <Flex direction="column" gap={2}>
                    <Text variant="subheader-2">{t('card_welcome_title')}</Text>
                    <Text>{t('card_welcome_text')}</Text>
                </Flex>
            </Card>

            <Card type="container" view="outlined" style={{padding: 'var(--g-spacing-5)'}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('card_tasks_title')}</Text>
                    <Text>{t('label_tasks', {count: tasks})}</Text>
                    <Flex gap={2} wrap>
                        <Button view="action" onClick={() => setTasks((n) => n + 1)}>
                            {t('button_add_task')}
                        </Button>
                        <Button view="outlined" onClick={() => setTasks(0)} disabled={tasks === 0}>
                            {t('button_reset')}
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            <Card type="container" view="outlined" style={{padding: 'var(--g-spacing-5)'}}>
                <Flex direction="column" gap={3}>
                    <Text variant="subheader-2">{t('card_pagination_title')}</Text>
                    <Text color="secondary">{t('card_pagination_text')}</Text>
                    <Text>
                        {t('label_page', {page, total: Math.ceil(TOTAL_ITEMS / pageSize)})}
                    </Text>
                    <div style={{overflowX: 'auto', maxWidth: '100%'}}>
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={TOTAL_ITEMS}
                            pageSizeOptions={[10, 20, 50]}
                            compact={false}
                            showInput
                            onUpdate={(nextPage, nextPageSize) => {
                                setPage(nextPage);
                                setPageSize(nextPageSize);
                            }}
                        />
                    </div>
                </Flex>
            </Card>
        </Flex>
    );
}

export function App() {
    return (
        <LangProvider>
            <AppContent />
        </LangProvider>
    );
}
