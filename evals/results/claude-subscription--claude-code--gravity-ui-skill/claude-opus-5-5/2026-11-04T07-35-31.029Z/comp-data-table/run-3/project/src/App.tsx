import {Box, Lang, configure} from '@gravity-ui/uikit';

import {DataTable} from './DataTable';
import {EMPLOYEES} from './data';

// Russian texts for built-in uikit strings (pagination, "no data", etc.).
configure({lang: Lang.Ru});

export function App() {
    return (
        <Box spacing={{p: 6}}>
            <DataTable data={EMPLOYEES} />
        </Box>
    );
}
