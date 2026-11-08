import {Box, Flex, Text} from '@gravity-ui/uikit';

// Side effects: configures DashKit (language, grid settings, widget plugins).
import './dashboard/setup';
import {Dashboard} from './dashboard/Dashboard';

export function App() {
    return (
        <Box spacing={{p: 6}}>
            <Flex direction="column" gap={6}>
                <Text variant="header-1">Дашборд</Text>
                <Dashboard />
            </Flex>
        </Box>
    );
}
