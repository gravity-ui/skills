import React from 'react';

import {
    Box,
    Button,
    Card,
    ClipboardButton,
    Flex,
    Lang,
    Pagination,
    SegmentedRadioGroup,
    Text,
    useLang,
} from '@gravity-ui/uikit';

import {i18n, setLanguage} from './i18n';

const LANG_OPTIONS = [
    {value: Lang.En, content: 'English'},
    {value: Lang.Ru, content: 'Русский'},
];

export function App() {
    // Re-renders the app whenever configure({lang}) is called,
    // so both uikit internals and app strings switch together.
    const {lang} = useLang();
    const currentLang = lang === Lang.Ru ? Lang.Ru : Lang.En;

    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [itemsCount, setItemsCount] = React.useState(1);

    return (
        <Box spacing={{p: 5}}>
            <Flex direction="column" gap={5} style={{maxWidth: 640, margin: '0 auto'}}>
                <Flex alignItems="center" gap={4}>
                    <div style={{flex: 1, minWidth: 0}}>
                        <Text variant="header-1">{i18n('title')}</Text>
                    </div>
                    <SegmentedRadioGroup<Lang>
                        aria-label={i18n('label_language')}
                        style={{flexShrink: 0}}
                        value={currentLang}
                        options={LANG_OPTIONS}
                        onUpdate={setLanguage}
                    />
                </Flex>

                <Text variant="body-2" color="secondary">
                    {i18n('description')}
                </Text>

                <Card spacing={{p: 4}}>
                    <Flex direction="column" gap={4}>
                        <Flex gap={2}>
                            <Button view="action" onClick={() => setItemsCount((c) => c + 1)}>
                                {i18n('button_get_started')}
                            </Button>
                            <Button view="outlined">{i18n('button_learn_more')}</Button>
                        </Flex>

                        <Flex direction="column" gap={2}>
                            <Text variant="body-1">{i18n('label_copy')}</Text>
                            <Flex alignItems="center" gap={2}>
                                <Text
                                    variant="code-1"
                                    color="secondary"
                                    style={{flex: 1, minWidth: 0}}
                                >
                                    {i18n('invite_link')}
                                </Text>
                                <ClipboardButton
                                    text={i18n('invite_link')}
                                    size="m"
                                    style={{flexShrink: 0}}
                                />
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap={2}>
                            <Text variant="body-1">{i18n('label_items')}</Text>
                            <Flex alignItems="center" gap={2}>
                                <Button view="outlined" onClick={() => setItemsCount((c) => Math.max(0, c - 1))}>
                                    −
                                </Button>
                                <Text variant="body-2" style={{flex: 1, minWidth: 0}}>
                                    {i18n('items_count', {count: itemsCount})}
                                </Text>
                                <Button view="outlined" onClick={() => setItemsCount((c) => c + 1)}>
                                    +
                                </Button>
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap={2}>
                            <Text variant="body-1">{i18n('label_pagination')}</Text>
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={95}
                                onUpdate={(nextPage, nextPageSize) => {
                                    setPage(nextPage);
                                    setPageSize(nextPageSize);
                                }}
                            />
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </Box>
    );
}
