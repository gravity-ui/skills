import {DashKit} from '@gravity-ui/dashkit';
import {pluginTitle, pluginText} from '@gravity-ui/dashkit';

import {ChartWidget} from './widgets/ChartWidget';
import {MetricWidget} from './widgets/MetricWidget';
import {TableWidget} from './widgets/TableWidget';

DashKit.setSettings({
    gridLayout: {margin: [12, 12]},
});

DashKit.registerPlugins(
    pluginTitle,
    pluginText.setSettings({
        apiHandler({text}) {
            return Promise.resolve({result: text});
        },
    }),
    {
        type: 'chart',
        defaultLayout: {w: 12, h: 10, minW: 6, minH: 6},
        renderer: ChartWidget,
    },
    {
        type: 'metric',
        defaultLayout: {w: 6, h: 4, minW: 4, minH: 3},
        renderer: MetricWidget,
    },
    {
        type: 'table',
        defaultLayout: {w: 18, h: 10, minW: 10, minH: 6},
        renderer: TableWidget,
    },
);
