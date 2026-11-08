import {Box, Flex, Text} from '@gravity-ui/uikit';

import {demoWidgetData} from './data';
import {VizWidget} from './widget/VizWidget';

export function App() {
    return (
        <Box maxWidth={1100} spacing={{p: 6}} style={{margin: '0 auto'}}>
            <Flex direction="column" gap={5}>
                <Text variant="header-1">Виджет визуализации</Text>
                <VizWidget title="Выручка и инфраструктура" data={demoWidgetData} height={360} />
            </Flex>
        </Box>
    );
}
