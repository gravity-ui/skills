import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import {Lang, configure} from '@gravity-ui/uikit';

import {GoalsWidget, MetricWidget, NoteWidget, OrdersWidget} from './widgets';
import {WIDGET_TYPE} from './types';

let isConfigured = false;

/**
 * DashKit требует настройки до первого рендера: язык, параметры сетки, плагины.
 * Вызывается один раз на уровне модуля.
 */
export function setupDashKit() {
    if (isConfigured) return;
    isConfigured = true;

    configure({lang: Lang.Ru});

    DashKit.setSettings({
        // 36 колонок по умолчанию, rowHeight 18px; задаём только отступы между виджетами.
        gridLayout: {margin: [8, 8]},
    });

    DashKit.registerPlugins(
        pluginTitle,
        {
            type: WIDGET_TYPE.Metric,
            defaultLayout: {w: 9, h: 7},
            renderer: MetricWidget,
        },
        {
            type: WIDGET_TYPE.Goals,
            defaultLayout: {w: 12, h: 13},
            renderer: GoalsWidget,
        },
        {
            type: WIDGET_TYPE.Orders,
            defaultLayout: {w: 24, h: 13},
            renderer: OrdersWidget,
        },
        {
            type: WIDGET_TYPE.Note,
            defaultLayout: {w: 12, h: 7},
            renderer: NoteWidget,
        },
    );
}
