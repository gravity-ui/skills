import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';

interface StubPageProps {
    title: string;
}

export function StubPage({title}: StubPageProps) {
    return (
        <div className="stub-page">
            <Flex direction="column" gap={2} alignItems="center">
                <Text variant="header-1">{title}</Text>
                <Text variant="body-2" color="secondary">
                    Раздел в разработке
                </Text>
            </Flex>
        </div>
    );
}
