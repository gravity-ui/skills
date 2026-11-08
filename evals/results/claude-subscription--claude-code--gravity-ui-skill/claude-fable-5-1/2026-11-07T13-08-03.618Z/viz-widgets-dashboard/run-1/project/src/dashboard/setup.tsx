import {DashKit, pluginText, pluginTitle} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

import {WidgetType} from './types';
import {ListWidget} from './widgets/ListWidget';
import {MetricWidget} from './widgets/MetricWidget';
import {ProgressWidget} from './widgets/ProgressWidget';
import {TableWidget} from './widgets/TableWidget';

let configured = false;

/** DashKit должен быть настроен до первого рендера: язык, параметры сетки, плагины. */
export function setupDashKit() {
    if (configured) {
        return;
    }
    configured = true;

    configure({lang: Lang.Ru});

    DashKit.setSettings({
        gridLayout: {cols: 36, rowHeight: 18, margin: [12, 12], containerPadding: [0, 0]},
    });

    DashKit.registerPlugins(
        pluginTitle,
        pluginText,
        {
            type: WidgetType.Metric,
            defaultLayout: {w: 9, h: 6, minW: 6, minH: 5},
            renderer: (props) => <MetricWidget {...props} />,
        },
        {
            type: WidgetType.Progress,
            defaultLayout: {w: 12, h: 10, minW: 8, minH: 6},
            renderer: (props) => <ProgressWidget {...props} />,
        },
        {
            type: WidgetType.Table,
            defaultLayout: {w: 18, h: 12, minW: 12, minH: 8},
            renderer: (props) => <TableWidget {...props} />,
        },
        {
            type: WidgetType.List,
            defaultLayout: {w: 12, h: 10, minW: 8, minH: 6},
            renderer: (props) => <ListWidget {...props} />,
        },
    );
}
