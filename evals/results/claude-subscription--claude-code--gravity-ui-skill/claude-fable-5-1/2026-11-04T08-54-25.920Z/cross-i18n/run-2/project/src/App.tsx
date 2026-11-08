import {useState} from 'react';
import {Button, Card, Flex, Pagination, Table, Text} from '@gravity-ui/uikit';

import {LanguageSwitcher} from './LanguageSwitcher';
import {t, useAppLang} from './i18n';

type Row = {id: string; name: string; status: string};

export function App() {
    const lang = useAppLang();
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);

    const rows: Row[] = [];
    const columns = [
        {id: 'name', name: t('column_name')},
        {id: 'status', name: t('column_status')},
    ];

    return (
        <Flex direction="column" gap={6} style={{maxWidth: 960, margin: '0 auto', padding: 'var(--g-spacing-6)'}}>
            <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
                <Text as="h1" variant="header-1" style={{flex: 1, minWidth: 0, margin: 0}}>
                    {t('title')}
                </Text>
                <div style={{flexShrink: 0}}>
                    <LanguageSwitcher />
                </div>
            </Flex>

            <Text variant="body-2" color="secondary">
                {t('subtitle')}
            </Text>

            <Card type="container" view="outlined" spacing={{p: 5}}>
                <Flex direction="column" gap={4}>
                    <Text variant="subheader-2">{t('section_app-strings')}</Text>
                    <Text variant="body-1">{t('label_current-language', {lang: t(`lang_${lang}`)})}</Text>
                    <Text variant="body-1">{t('label_items', {count})}</Text>
                    <Flex gap={2}>
                        <Button view="action" onClick={() => setCount((value) => value + 1)}>
                            {t('button_add-item')}
                        </Button>
                        <Button view="normal" onClick={() => setCount(0)}>
                            {t('button_reset')}
                        </Button>
                    </Flex>
                </Flex>
            </Card>

            <Card type="container" view="outlined" spacing={{p: 5}}>
                <Flex direction="column" gap={4}>
                    <Text variant="subheader-2">{t('section_uikit-strings')}</Text>
                    <Text variant="body-1" color="secondary">
                        {t('hint_uikit-strings')}
                    </Text>
                    <Pagination
                        page={page}
                        pageSize={10}
                        total={50}
                        compact={false}
                        onUpdate={(nextPage) => setPage(nextPage)}
                    />
                    <Table data={rows} columns={columns} />
                </Flex>
            </Card>
        </Flex>
    );
}
