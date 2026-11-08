import React from 'react';
import {Card, Flex} from '@gravity-ui/uikit';

import {makeMonitoring, makeSales} from './data';
import {ChartWidget} from './widgets/ChartWidget';

export function App() {
    const sales = React.useMemo(makeSales, []);
    const monitoring = React.useMemo(() => makeMonitoring(), []);

    return (
        <Flex style={{padding: 24, minWidth: 0}}>
            <Card view="outlined" style={{flex: 1, minWidth: 0, padding: 16}}>
                <ChartWidget sales={sales} monitoring={monitoring} />
            </Card>
        </Flex>
    );
}
