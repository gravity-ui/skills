import * as React from 'react';
import {Alert, Button, Card, Flex, Pagination, Table, Text} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './components/LanguageSwitcher';
import {t, useAppLang} from './i18n';

interface Item {
    id: number;
    name: string;
    status: string;
}

const LANG_NAMES: Record<string, string> = {en: 'English', ru: 'Русский'};

export function App() {
    // Subscribing to the language makes the whole page re-render when it changes,
    // so `t(...)` calls below always return strings for the current language.
    const lang = useAppLang();

    const [items, setItems] = React.useState<Item[]>([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [alertVisible, setAlertVisible] = React.useState(true);

    const columns = [
        {id: 'name', name: t('column_name')},
        {id: 'status', name: t('column_status')},
    ];

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {id: prev.length + 1, name: `#${prev.length + 1}`, status: lang === 'ru' ? 'Активен' : 'Active'},
        ]);
    };

    return (
        <Flex direction="column" gap={6} style={{padding: 'var(--g-spacing-6)', maxWidth: 960, margin: '0 auto'}}>
            <Flex as="header" alignItems="center" justifyContent="space-between" gap={4} wrap>
                <div style={{flex: 1, minWidth: 0}}>
                    <Text as="div" variant="header-1" ellipsis>
                        {t('title')}
                    </Text>
                    <Text as="div" variant="body-1" color="secondary">
                        {t('subtitle')}
                    </Text>
                </div>
                <div style={{flexShrink: 0}}>
                    <LanguageSwitcher />
                </div>
            </Flex>

            {alertVisible && (
                <Alert
                    theme="info"
                    title={t('alert_title')}
                    message={t('alert_message')}
                    onClose={() => setAlertVisible(false)}
                />
            )}

            <Card view="outlined" type="container" spacing={{p: 5}}>
                <Flex direction="column" gap={4}>
                    <Text as="div" variant="subheader-2">
                        {t('section_app-strings')}
                    </Text>
                    <Text as="div" variant="body-1">
                        {t('label_current-language', {lang: LANG_NAMES[lang] ?? lang})}
                    </Text>
                    <Flex alignItems="center" gap={3} wrap>
                        <Button view="action" onClick={addItem}>
                            {t('button_add')}
                        </Button>
                        <Button view="outlined" onClick={() => setItems([])} disabled={items.length === 0}>
                            {t('button_reset')}
                        </Button>
                        <Text variant="body-1" color="secondary">
                            {t('label_items', {count: items.length})}
                        </Text>
                    </Flex>
                </Flex>
            </Card>

            <Card view="outlined" type="container" spacing={{p: 5}}>
                <Flex direction="column" gap={5}>
                    <div>
                        <Text as="div" variant="subheader-2">
                            {t('section_uikit-strings')}
                        </Text>
                        <Text as="div" variant="body-1" color="secondary">
                            {t('hint_uikit-strings')}
                        </Text>
                    </div>

                    <Flex direction="column" gap={2}>
                        <Text variant="subheader-1">{t('label_pagination')}</Text>
                        <div style={{overflowX: 'auto', maxWidth: '100%'}}>
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={120}
                                compact={false}
                                showInput
                                pageSizeOptions={[10, 20, 50]}
                                onUpdate={(nextPage, nextPageSize) => {
                                    setPage(nextPage);
                                    setPageSize(nextPageSize);
                                }}
                            />
                        </div>
                    </Flex>

                    <Flex direction="column" gap={2}>
                        <Text variant="subheader-1">{t('label_empty-table')}</Text>
                        <Table<Item> data={items} columns={columns} width="max" />
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}
