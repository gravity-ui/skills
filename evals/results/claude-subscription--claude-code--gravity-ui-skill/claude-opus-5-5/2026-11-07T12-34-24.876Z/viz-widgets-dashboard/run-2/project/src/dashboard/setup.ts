// One-time DashKit configuration: must run before <DashKit> is rendered.
import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

import {WidgetType} from './types';
import {EventsWidget, GoalsWidget, MetricWidget, NoteWidget} from './widgets';

/** Grid: 36 columns, 18px rows, 8px gutters (= --g-spacing-2). */
export const GRID_COLUMNS = 36;

configure({lang: Lang.Ru});

DashKit.setSettings({
    gridLayout: {margin: [8, 8]},
    isMobile: false,
});

DashKit.registerPlugins(
    pluginTitle,
    {
        type: WidgetType.Metric,
        defaultLayout: {w: 9, h: 6, minW: 6, minH: 5},
        renderer: MetricWidget,
    },
    {
        type: WidgetType.Goals,
        defaultLayout: {w: 18, h: 11, minW: 9, minH: 6},
        renderer: GoalsWidget,
    },
    {
        type: WidgetType.Events,
        defaultLayout: {w: 18, h: 11, minW: 12, minH: 6},
        renderer: EventsWidget,
    },
    {
        type: WidgetType.Note,
        defaultLayout: {w: 12, h: 7, minW: 6, minH: 4},
        renderer: NoteWidget,
    },
);
