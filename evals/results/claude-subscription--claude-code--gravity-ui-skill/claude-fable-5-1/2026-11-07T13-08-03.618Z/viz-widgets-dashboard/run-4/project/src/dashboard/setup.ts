import {DashKit, pluginText, pluginTitle} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

import {chartPlugin} from './widgets/ChartWidget';
import {meterPlugin} from './widgets/MeterWidget';
import {statPlugin} from './widgets/StatWidget';
import {tablePlugin} from './widgets/TableWidget';

export const WidgetType = {
    Title: 'title',
    Text: 'text',
    Stat: 'stat',
    Chart: 'chart',
    Meter: 'meter',
    Table: 'table',
} as const;

let configured = false;

/** DashKit must be configured once before the first render. */
export function setupDashKit() {
    if (configured) {
        return;
    }
    configured = true;

    configure({lang: Lang.Ru});

    DashKit.setSettings({
        gridLayout: {margin: [12, 12], rowHeight: 18, cols: 36},
    });

    DashKit.registerPlugins(pluginTitle, pluginText, statPlugin, chartPlugin, meterPlugin, tablePlugin);
}
