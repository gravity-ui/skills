import {Box, Text} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {generateEmployees} from './employees';

const employees = generateEmployees(57);

export function App() {
    return (
        <Box spacing={{p: 6}}>
            <Text variant="header-1" as="h1" style={{margin: 0}}>
                Сотрудники
            </Text>
            <Box spacing={{mt: 4}}>
                <DataTable data={employees} />
            </Box>
        </Box>
    );
}
