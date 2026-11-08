import React from 'react';

import {makeMonitoring, makeSales} from './demo-data';
import {ChartWidget} from './widget';

export function App() {
    const data = React.useMemo(() => ({sales: makeSales(), monitoring: makeMonitoring()}), []);

    return (
        <div style={{padding: 24, maxWidth: 960}}>
            <ChartWidget
                data={data}
                defaultMode="sales"
                title={{sales: 'Продажи по регионам, тыс. ₽ в день', monitoring: 'Загрузка CPU, %'}}
                unit={{sales: 'тыс. ₽', monitoring: '%'}}
                timeZone="Europe/Moscow"
            />
        </div>
    );
}
