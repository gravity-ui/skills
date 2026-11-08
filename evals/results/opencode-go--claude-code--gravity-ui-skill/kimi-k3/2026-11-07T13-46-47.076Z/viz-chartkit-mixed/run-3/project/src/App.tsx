import {Box, Flex, Text} from '@gravity-ui/uikit';

import {VizWidget} from './widgets/VizWidget/VizWidget';

export function App() {
    return (
        <Box spacing={{p: 5}} style={{maxWidth: 1040, margin: '0 auto'}}>
            <Flex direction="column" gap={4}>
                <Flex direction="column" gap={1}>
                    <Text variant="header-1">Виджет визуализации</Text>
                    <Text variant="body-2" color="secondary">
                        Единый API ChartKit для двух режимов: обычный линейный график продаж
                        (@gravity-ui/charts) и плотный временной ряд мониторинга (@gravity-ui/yagr).
                        Движок каждого режима подгружается лениво при первом показе.
                    </Text>
                </Flex>
                <VizWidget />
            </Flex>
        </Box>
    );
}
